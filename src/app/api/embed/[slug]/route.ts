// src/app/api/embed/[slug]/route.ts
// Serves a lightweight JS bundle (~2kb) that any website can drop in with:
//   <div id="qp-embed"></div>
//   <script src="https://queuepath.io/api/embed/my-waitlist" async></script>
//
// The script renders an iframe pointing to /embed/[slug] and auto-resizes it.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const target = searchParams.get("target") ?? "qp-embed";

  // Verify waitlist exists and is active
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug, isActive: true },
    select: { id: true, name: true },
  });

  if (!waitlist) {
    const notFoundJs = `console.warn('[QueuePath] Waitlist "${slug}" not found or inactive.');`;
    return new NextResponse(notFoundJs, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://queuepath.io";
  const embedUrl = `${baseUrl}/embed/${slug}?theme=${theme}`;

  // Get ref code from the page URL if present
  const js = `
(function() {
  'use strict';

  var EMBED_URL = ${JSON.stringify(embedUrl)};
  var TARGET_ID = ${JSON.stringify(target)};
  var WAITLIST_NAME = ${JSON.stringify(waitlist.name)};

  function getRefCode() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    } catch(e) { return ''; }
  }

  function createEmbed() {
    var container = document.getElementById(TARGET_ID);
    if (!container) {
      console.warn('[QueuePath] No element found with id="' + TARGET_ID + '". Add <div id="' + TARGET_ID + '"></div> where you want the form.');
      return;
    }

    var ref = getRefCode();
    var src = EMBED_URL + (ref ? '&ref=' + encodeURIComponent(ref) : '');

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Join ' + WAITLIST_NAME + ' waitlist';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.style.cssText = 'width:100%;border:none;display:block;overflow:hidden;';
    iframe.height = '320';

    // Auto-resize via postMessage
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'queuepath:resize') {
        iframe.height = e.data.height;
      }
      if (e.data && e.data.type === 'queuepath:success') {
        container.dispatchEvent(new CustomEvent('queuepath:success', {
          bubbles: true,
          detail: { position: e.data.position }
        }));
      }
    });

    container.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createEmbed);
  } else {
    createEmbed();
  }
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
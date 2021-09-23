import { rewriteEsiResponse, createEsiContext, isEsiEnabledForRequest } from '@uniformdev/esi-edge-cloudflare';

const DEBUG = (_DEBUG === '1');
const SHOW_ERRORS = (_SHOW_ERRORS === '1');
const WAIT_FOR_RESPONSE = (_WAIT_FOR_RESPONSE === '1');

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (SHOW_ERRORS) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  try {
    // `event.request.url` can be used to determine response with ESI instead of `Content-Type`
    const esiEnabled = isEsiEnabledForRequest(event.request);
    const response =  await fetchResponse(event, esiEnabled);
    
    // do not process content without ESI
    if (!esiEnabled) {
      return response;
    }

    //
    //START: Uniform code
    //
    const esiContext = createEsiContext(event.request, {debug: DEBUG});
    const rewritedResponse = rewriteEsiResponse(esiContext, response,{debug: DEBUG});
    //
    //END: Uniform code
    //

    // do not cache ESI-based content
    if (esiEnabled) {
      rewritedResponse.headers.set("Cache-Control", "no-cache");
    }
    else {
      rewritedResponse.headers.set("Cache-Control", "public, max-age=604800, immutable");
    }

    if (WAIT_FOR_RESPONSE) {
      // read the stream to the end to catch errors
      const blob = await rewritedResponse.blob();
      return new Response(blob, rewritedResponse);
    }

    return rewritedResponse;

  } catch (e) {
    if (!SHOW_ERRORS) {
      try {
        const notFoundUrl = `${new URL(event.request.url).origin}/404.html`;
        let notFoundResponse = await fetch(notFoundUrl);

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) { }
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

async function fetchResponse(event, esiEnabled) {
  if (!esiEnabled) {
    return await fetch(event.request);
  }

  const req = new Request(event.request, {
    headers: {
      'Accept-ESI' : '1.0'
    }
  });

  return await fetch(req);
}

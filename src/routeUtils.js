export function formatRoute(route) {
    if (!route) {
        return route;
    }

    // `removeQueryStringFromRoute` shouldn't be necessary, but we have it as a "safety" measure.
    return removeQueryStringFromRoute(ensureLeadingSlash(route));
}

export function ensureLeadingSlash(route) {
    const formattedRoute = !route.startsWith('/') ? `/${route}` : route;
    return formattedRoute;
}

export function removeQueryStringFromRoute(route) {
    const queryIndex = route.indexOf('?');
    if (queryIndex !== -1) {
        const formattedRoute = route.substring(0, queryIndex);
        return formattedRoute;
    }
    return route;
}

export function resolveParams(routeParams, getCurrentLanguage) {
    const { sitecoreRoute, lang, ...queryStringParams } = routeParams;

    // `sitecoreRoute` param may be undefined when the current URL is `/` or
    // when the current URL is just a language parameter, e.g. `/en`, `/nl-NL`
    // In those scenarios, we default to `/` for the route.
    const resolvedRoute = sitecoreRoute || '/';

    // determine language by route first, then by "state" (i18n.language), else fallback to default config
    const resolvedLanguage = lang || getCurrentLanguage();

    return {
        resolvedRoute,
        resolvedLanguage,
        queryStringParams,
    };
}

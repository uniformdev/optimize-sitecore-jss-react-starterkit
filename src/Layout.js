import React, { useState, useEffect } from "react";
import {
  Placeholder,
  VisitorIdentification,
  withSitecoreContext,
} from "@sitecore-jss/sitecore-jss-react";
import { NavLink, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import Helmet from "react-helmet";
import { useSitecoreTracker } from "@uniformdev/tracking-react";
import { SitecorePersonalizationContextProvider } from "@uniformdev/personalize-react";
import { doTracking } from "@uniformdev/optimize-js";
import config from "./temp/config";

// Using bootstrap is completely optional. It's used here to provide a clean layout for samples,
// without needing extra CSS in the sample app. Remove it in package.json as well if it's removed here.
import "bootstrap/dist/css/bootstrap.css";
import "./assets/app.css";

const clientSideRouting = false;
const enableEsiDebugging = false;
const sitecoreApiKey = config.sitecoreApiKey;

/*
  APP LAYOUT
  This is where the app's HTML structure and root placeholders should be defined.

  All routes share this root layout by default (this could be customized in RouteHandler),
  but components added to inner placeholders are route-specific.
*/

// This is boilerplate navigation for sample purposes. Most apps should throw this away and use their own navigation implementation.
// Most apps may also wish to use GraphQL for their navigation construction; this sample does not simply to support disconnected mode.

const formatLink = (url, location, inner) => {
  if (clientSideRouting) {
    return (
      <NavLink to={url} style={{ padding: "10px" }} className="text-dark">
        {inner}
      </NavLink>
    );
  }
  return (
    <a href={url} style={{ padding: "10px" }} className="text-dark">
      {inner}
    </a>
  );
};

/*** TODO: START BLOCK - CLIENT-SIDE ROUTING ***/
let NavigationCs = ({ t, i18n, location }) => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom">
      <h5 className="my-0 mr-md-auto font-weight-normal">
        {formatLink(
          "/",
          location,
          t("Uniform Optimize kit for Sitecore JSS React")
        )}
      </h5>
      <nav className="my-2 my-md-0 mr-md-3">
        {formatLink("/architecture", location, t("Architecture"))}
        {formatLink("/development", location, t("Development"))}
        {formatLink("/marketing", location, t("Marketing"))}
        {formatLink("/security", location, t("Security"))}
        {formatLink("/set-goal", location, t("Set goal"))}
        {formatLink("/location", location, t("Location"))}
      </nav>
    </div>
  );
};
/*** TODO: END BLOCK - CLIENT-SIDE ROUTING ***/

/*** TODO: START BLOCK - SERVER-SIDE ROUTING ***/
let NavigationSs = ({ t, i18n }) => (
  <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom">
    <h5 className="my-0 mr-md-auto font-weight-normal">
      {t("Uniform Optimize kit for Sitecore JSS React")}
    </h5>
    <nav className="my-2 my-md-0 mr-md-3">
      <a href="/architecture" className="p-2 text-dark">
        {t("Architecture")}
      </a>
      <a href="/development" className="p-2 text-dark">
        {t("Development")}
      </a>
      <a href="/marketing" className="p-2 text-dark">
        {t("Marketing")}
      </a>
      <a href="/security" className="p-2 text-dark">
        {t("Security")}
      </a>
      <a href="/set-goal" className="p-2 text-dark">
        {t("Set goal")}
      </a>
      <a href="/Location" className="p-2 text-dark">
        {t("Location")}
      </a>
    </nav>
  </div>
);
/*** TODO: END BLOCK - SERVER-SIDE ROUTING ***/

// inject dictionary props (`t`) into navigation so we can translate it
// NOTE: using this is needed instead of using i18next directly to keep
// the component state updated when i18n state (e.g. current language) changes
const Navigation = withTranslation()(
  clientSideRouting ? NavigationCs : NavigationSs
);

const LayoutCs = ({ route, sitecoreContext }) => {
  //
  // OPTIONAL: Location from the router is used to drive
  //           some dynamic logic for generating site nav.
  const location = useLocation();
  const siteName =
    sitecoreContext && sitecoreContext.site
      ? sitecoreContext.site.name
      : undefined;

  /*** TODO: START BLOCK - CLIENT-SIDE ROUTING ***/
  const [currentRoute, setCurrentRoute] = useState();
  const [isTrackerInitialized, setIsTrackerInitialized] = useState(false);
  //
  useEffect(() => {
    setCurrentRoute(route);
  }, [route]);
  //
  //
  useSitecoreTracker(sitecoreContext, {
    clientSideRouting: true,
    onInitialized: () => {
      setIsTrackerInitialized(true);
    },
    type: "jss",
    scripts: {
      optimize: "/dist/uniform-jss-kit/uniform.optimize.min.js",
    },
  });
  //
  //The tracker should only be called when two conditions are met:
  // 1. Route is set
  // 2. Tracker is initialized
  useEffect(() => {
    const shouldNotTrack = () =>
      !currentRoute ||
      isTrackerInitialized !== true ||
      !sitecoreContext ||
      !sitecoreContext.tracking ||
      !sitecoreContext.tracking.item ||
      currentRoute.itemId !== sitecoreContext.tracking.item.id;
    if (shouldNotTrack()) return;
    //
    //There are several ways to get a reference to the tracker.
    //  1. useSitecoreTracker hook sets the tracker on the TrackerContext
    //  2. useSitecoreTracker hook returns the tracker
    //  3. uniform.optimize.min.js script exposes the doTracking function
    //
    //In this example, option 3 is used because it is
    //preconfigured to read the visitor id from the
    //cookie (the other options require the developer
    //find the visitor id).
    doTracking({
      source: "sitecore",
      context: sitecoreContext
    });
  }, [currentRoute, isTrackerInitialized, sitecoreContext]);
  /*** TODO: END BLOCK - CLIENT-SIDE ROUTING ***/
  return getComponent(sitecoreContext, siteName, route, location);
};

const LayoutSs = ({ route, sitecoreContext }) => {
  //
  // OPTIONAL: Location from the router is used to drive
  //           some dynamic logic for generating site nav.
  const location = useLocation();
  const siteName =
    sitecoreContext && sitecoreContext.site
      ? sitecoreContext.site.name
      : undefined;

  /*** TODO: START BLOCK - SERVER-SIDE ROUTING ***/
  useSitecoreTracker(sitecoreContext, {
    type: "jss"
  });
  /*** TODO: END BLOCK - SERVER-SIDE ROUTING ***/
  return getComponent(sitecoreContext, siteName, route, location);
};

function getComponent(sitecoreContext, siteName, route, location) {
  return (
    <SitecorePersonalizationContextProvider
      contextData={sitecoreContext}
      personalizationMode="jss-esi"
      sitecoreApiKey={sitecoreApiKey}
      sitecoreSiteName={siteName}
    >
      <React.Fragment>
        {/* react-helmet enables setting <head> contents, like title and OG meta tags */}
        <Helmet>
          <title>
            {(route.fields &&
              route.fields.pageTitle &&
              route.fields.pageTitle.value) ||
              "Page"}
          </title>
        </Helmet>

        {/*
          VisitorIdentification is necessary for Sitecore Analytics to determine if the visitor is a robot.
          If Sitecore XP (with xConnect/xDB) is used, this is required or else analytics will not be collected for the JSS app.
          For XM (CMS-only) apps, this should be removed.

          VI detection only runs once for a given analytics ID, so this is not a recurring operation once cookies are established.
        */}
        <VisitorIdentification />

        <Navigation location={location.pathname} mode="client" />

        {/* root placeholder for the app, which we add components to using route data */}
        <div className="container">
          {/* 
            If ESI context debugging is enabled, add the esi-context 
            placeholder. A component in the placeholder will write
            the ESI context variables to the JavaScript console.
           */}
          {enableEsiDebugging && (
            <Placeholder name="esi-context" rendering={route} />
          )}
          <Placeholder name="jss-main" rendering={route} />
        </div>
      </React.Fragment>
    </SitecorePersonalizationContextProvider>
  );
}

export default withSitecoreContext()(clientSideRouting ? LayoutCs : LayoutSs);

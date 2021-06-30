import React from 'react';
import { Placeholder } from '@sitecore-jss/sitecore-jss-react';

/*
  APP LAYOUT
  This is where the app's HTML structure and root placeholders should be defined.

  All routes share this root layout by default (this could be customized in RouteHandler),
  but components added to inner placeholders are route-specific.
*/

const TestLayout = ({ route }) => (
  <>
    <i>uniform jss-demo test layout</i>
    <br />
    <Placeholder name="uniform-jss-content" rendering={route} />
  </>
);

export default TestLayout;
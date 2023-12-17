import { Form, Link } from '@remix-run/react';
import { LTIConnectionOwnerVisibleParams } from '~/shared/ltiConnection';

// const LTI_HOST = 'rea.gent';
const LTI_HOST = 'dev.rea.gent';

const ltiXml = `<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
  xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0" xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0"
  xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0p1.xsd http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">
  <blti:title>reagent</blti:title>
  <blti:description>reagent noggins</blti:description>
  <blti:launch_url>https://${LTI_HOST}/auth/ltiv1p3</blti:launch_url>
  <blti:icon>https://www.edu-apps.org/assets/lti_redirect_engine/redirect_icon.png</blti:icon>
  <blti:extensions platform="canvas.instructure.com">
    <lticm:options name="course_navigation">
      <lticm:property name="enabled">true</lticm:property>
      <lticm:property name="visibility">public</lticm:property>
      <lticm:property name="windowTarget">_blank</lticm:property>
    </lticm:options>
    <lticm:property name="icon_url">https://www.edu-apps.org/assets/lti_redirect_engine/redirect_icon.png
    </lticm:property>
    <lticm:property name="link_text"></lticm:property>
    <lticm:property name="privacy_level">public</lticm:property>
    <lticm:property name="tool_id">redirect</lticm:property>
  </blti:extensions>
</cartridge_basiclti_link>`;

export default function LTIConnectionConfig({
  ltiConnection,
}: {
  ltiConnection: LTIConnectionOwnerVisibleParams | null;
}) {
  if (!ltiConnection) {
    return (
      <div>
        <Form method="post">
          <input type="hidden"
          name="action"
          value="createLTIConnection"
          />
          <button
            type="submit"
            style={{ display: 'block' }}
          >
            Set up an LTI connection to allow users to join the organization
            through your course site.
          </button>
        </Form>
      </div>
    );
  }

  return (
    <div>
      <p>This organization can be joined through LTI.</p>
      <p>
        LTI consumer key: <code>{ltiConnection.consumerKey}</code>
      </p>
      <p>
        LTI consumer sercret: <code>{ltiConnection.consumerSecret}</code>
      </p>
      <p>
        LTI XML: <code>{ltiXml}</code>
      </p>
      <p>
        Connection name:{' '}
        {ltiConnection.lastSeenConsumerName ? (
          ltiConnection.lastSeenConsumerName
        ) : (
          <em>unavailable</em>
        )}
      </p>
    </div>
  );
}

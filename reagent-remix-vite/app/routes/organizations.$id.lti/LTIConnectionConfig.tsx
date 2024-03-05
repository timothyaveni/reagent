import { Button, Stack, Typography } from '@mui/material';
import { Form } from '@remix-run/react';
import CopyableCode from '~/components/CopyableCode';
import T from '~/i18n/T';
import { LTIConnectionOwnerVisibleParams } from '~/shared/ltiConnection';

const ltiXml = (LTI_BASE_URL: string) => `<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
  xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0" xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0"
  xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0p1.xsd http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">
  <blti:title>reagent</blti:title>
  <blti:description>reagent noggins</blti:description>
  <blti:launch_url>${LTI_BASE_URL}/auth/ltiv1p3</blti:launch_url>
  ${
    /*todo*/ ''
  }<blti:icon>https://www.edu-apps.org/assets/lti_redirect_engine/redirect_icon.png</blti:icon>
  <blti:extensions platform="canvas.instructure.com">
    <lticm:options name="course_navigation">
      <lticm:property name="enabled">true</lticm:property>
      <lticm:property name="visibility">public</lticm:property>
      <lticm:property name="windowTarget">_blank</lticm:property>
    </lticm:options>
    ${
      /*todo*/ ''
    }<lticm:property name="icon_url">https://www.edu-apps.org/assets/lti_redirect_engine/redirect_icon.png
    </lticm:property>
    <lticm:property name="link_text"></lticm:property>
    <lticm:property name="privacy_level">public</lticm:property>
    <lticm:property name="tool_id">redirect</lticm:property>
  </blti:extensions>
</cartridge_basiclti_link>`;

export default function LTIConnectionConfig({
  ltiConnection,
  ltiBaseUrl,
}: {
  ltiConnection: LTIConnectionOwnerVisibleParams | null;
  ltiBaseUrl: string;
}) {
  if (!ltiConnection) {
    return (
      <div>
        <Form method="post">
          <input type="hidden" name="action" value="createLTIConnection" />
          <Typography variant="body1">
            Set up an LTI connection to allow users to join the organization
            through your course site.
          </Typography>
          <Button variant="outlined" type="submit" style={{ display: 'block' }}>
            Create LTI connection
          </Button>
        </Form>
      </div>
    );
  }

  const xml = ltiXml(ltiBaseUrl);

  return (
    <div>
      <Typography variant="body1" component="p">
        This organization can be joined through LTI.
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1" component="p">
            <T>LTI consumer key:</T>
          </Typography>
          <CopyableCode text={ltiConnection.consumerKey} />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1" component="p">
            <T>LTI consumer secret:</T>
          </Typography>
          <CopyableCode text={ltiConnection.consumerSecret} />
        </Stack>
        <Stack direction="column" spacing={2}>
          <Typography variant="body1" component="p">
            <T>LTI XML:</T>
          </Typography>
          <CopyableCode text={xml} />
        </Stack>
      </Stack>
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

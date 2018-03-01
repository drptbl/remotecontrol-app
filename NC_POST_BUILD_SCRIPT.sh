#!/bin/sh

if [ "$NEVERCODE_BUILD_STEP_STATUS" == "success" ]
then
		protractor tests/e2e/protractor_ci.conf.js || :
fi

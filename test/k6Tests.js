/* eslint-disable import/extensions */
/* eslint-disable import/no-duplicates */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import { sleep, group } from 'k6';
import TestGET from './loadTestGET.js';
import TestPOST from './loadTestPOST.js';
import TestREPORT from './loadTestREPORT.js';
import TestHELPFUL from './loadTestHELPFUL.js';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '5s',
      preAllocatedVUs: 150,
      maxVUs: 225,
    },
  },
  thresholds: { http_req_duration: ['p(98)<18'] },
};

export default () => {
  group('GET request', () => {
    TestGET();
  });

  group('POST request', () => {
    TestPOST();
  });

  group('report PUT request', () => {
    TestREPORT();
  });

  group('helpful PUT request', () => {
    TestHELPFUL();
  });

  sleep(1);
};

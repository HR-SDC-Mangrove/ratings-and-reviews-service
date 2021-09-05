/* eslint-disable no-undef */
const assert = require('assert');
const chai = require('chai');
const express = require('express');
const request = require('supertest');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

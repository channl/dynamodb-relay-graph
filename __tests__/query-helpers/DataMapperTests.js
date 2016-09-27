/* @flow */
import { toGlobalId } from 'graphql-relay';
import TestDataMapper from '../acceptance/TestDataMapper';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { User } from '../acceptance/GraphQLTypes';

describe('DataMapperTests', () => {
  it('toDataModel', () => {

    let model: User = {
      id: toGlobalId('User', 'MLVPsHX4SP2y3tJBdcZMOw=='),
      phoneNumber: '12345',
      lastName: 'Surname',
      createDate: 1449176057285,
      privateTagId: toGlobalId('Tag', 'Oo+faInGR9uIRrPnt0ugvQ=='),
      password: '',
      isVerified: true,
      tagId: toGlobalId('Tag', 'Mbkhm+2QSJy4YYZ++Avqvg=='),
      firstName: 'Name',
      countryCode: 'GB',
      verificationCode: '938834',
      imageUrl: null,
    };

    let dataModel = {
      type: 'User',
      dataModel: {
        id: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64'),
        phoneNumber: '12345',
        lastName: 'Surname',
        createDate: 1449176057285,
        privateTagId: new Buffer('Oo+faInGR9uIRrPnt0ugvQ==', 'base64'),
        password: '',
        isVerified: true,
        tagId: new Buffer('Mbkhm+2QSJy4YYZ++Avqvg==', 'base64'),
        firstName: 'Name',
        countryCode: 'GB',
        verificationCode: '938834',
        imageUrl: null,
      }
    };

    let mapper = new TestDataMapper();
    let result = mapper.toDataModel(model);
    expect(result).to.deep.equal(dataModel);
  });

  it('fromDataModel', () => {

    let dataModel = {
      id: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64'),
      phoneNumber: '12345',
      lastName: 'Surname',
      createDate: 1449176057285,
      privateTagId: new Buffer('Oo+faInGR9uIRrPnt0ugvQ==', 'base64'),
      password: '',
      isVerified: true,
      tagId: new Buffer('Mbkhm+2QSJy4YYZ++Avqvg==', 'base64'),
      firstName: 'Name',
      countryCode: 'GB',
      verificationCode: '938834',
      imageUrl: null,
    };

    let model: User = {
      id: toGlobalId('User', 'MLVPsHX4SP2y3tJBdcZMOw=='),
      phoneNumber: '12345',
      lastName: 'Surname',
      createDate: 1449176057285,
      privateTagId: toGlobalId('Tag', 'Oo+faInGR9uIRrPnt0ugvQ=='),
      password: '',
      isVerified: true,
      tagId: toGlobalId('Tag', 'Mbkhm+2QSJy4YYZ++Avqvg=='),
      firstName: 'Name',
      countryCode: 'GB',
      verificationCode: '938834',
      imageUrl: null,
    };

    let mapper = new TestDataMapper();
    let result = mapper.fromDataModel('User', dataModel);
    expect(result).to.deep.equal(model);
  });
});

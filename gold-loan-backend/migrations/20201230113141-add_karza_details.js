'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('karza_detail', [{
      panUrl: 'https://testapi.karza.in/v2/pan',
      pan_verify_url: 'https://testapi.karza.in/v2/pan-authentication',
      name_url: 'https://testapi.karza.in/v3/name',
      kyc_ocr_url: 'https://testapi.karza.in/v3/ocr/kyc',
      form_ocr_url: 'https://testapi.karza.in/v2/ocr/tds',
      dl_authentication_url: 'https://testapi.karza.in/v3/dl',
      voter_id_authentication_url: 'https://testapi.karza.in/v2/voter',
      passport_verification_url: 'https://testapi.karza.in/v3/passport-verification',
      key: 'dcYc9efeuBLVImxk',
      consent: 'Y',
      type: 'individual',
      preset: 'L',
      env: 'TEST',
      confidence_val1: 0.7,
      confidence_val2: 0.7,
      name_confidence: 0.7,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      panUrl: 'https://testapi.karza.in/v2/pan',
      pan_verify_url: 'https://testapi.karza.in/v2/pan-authentication',
      name_url: 'https://testapi.karza.in/v3/name',
      kyc_ocr_url: 'https://testapi.karza.in/v3/ocr/kyc',
      form_ocr_url: 'https://testapi.karza.in/v2/ocr/tds',
      dl_authentication_url: 'https://testapi.karza.in/v3/dl',
      voter_id_authentication_url: 'https://testapi.karza.in/v2/voter',
      passport_verification_url: 'https://testapi.karza.in/v3/passport-verification',
      key: 'dcYc9efeuBLVImxk',
      consent: 'Y',
      type: 'individual',
      preset: 'L',
      env: 'PRODUCTION',
      confidence_val1: 0.7,
      confidence_val2: 0.7,
      name_confidence: 0.7,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};

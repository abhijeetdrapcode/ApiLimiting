import moment from 'moment';

export const preparePayloadForCibilRequest = async (
  data,
  firstNameField,
  middleNameField,
  lastNameField,
  birthDateField,
  genderField,
  panNumberField,
  telephoneNumberField,
  lineOneField,
  lineTwoField,
  stateField,
  pinCodeField,
  credentials,
  dateFormat,
) => {
  const { memberRefId, enquiryMemberUserId, enquiryPassword } = credentials;
  const firstName = data[firstNameField] || '';
  const middleName = data[middleNameField] || '';
  const lastName = data[lastNameField] || '';
  const birthDate = data[birthDateField] || '';
  const gender = data[genderField] || '';
  const panNumber = data[panNumberField] || '';
  let telephoneNumber = data[telephoneNumberField] || '';
  if (!telephoneNumber || !telephoneNumber.startsWith('+91')) {
    return { code: 400, message: 'Mobile number must include country code +91' };
  }
  telephoneNumber = telephoneNumber.replace(/^\+91[\s-]*/, '').replace(/\s+/g, '');
  const line1 = data[lineOneField] || '';
  const line2 = data[lineTwoField] || '';
  const state = data[stateField] || '';
  const pinCode = data[pinCodeField] || '';
  const stateCode = stateCodesMapping[state?.toLowerCase().trim()] || '';
  const genderCode = genderMapping[gender?.toLowerCase().trim()] || '0';
  let formattedBirthDate = '';
  if (birthDate) {
    const parsedDate = moment(birthDate, dateFormat, true);
    if (!parsedDate.isValid()) {
      return {
        code: 400,
        message: `Invalid date format: expected ${dateFormat}, got ${birthDate}`,
      };
    }
    formattedBirthDate = parsedDate.format('DDMMYYYY');
  }
  return {
    serviceCode: 'CAS10001',
    monitoringDate: new Date().toISOString().slice(0, 10).split('-').join(''),
    consumerInputSubject: {
      tuefHeader: {
        headerType: 'TUEF',
        version: '12',
        memberRefNo: memberRefId,
        gstStateCode: stateCode,
        enquiryMemberUserId,
        enquiryPassword,
        enquiryPurpose: '10',
        enquiryAmount: '000049500',
        scoreType: '08',
        outputFormat: '03',
        responseSize: '1',
        ioMedia: 'CC',
        authenticationMethod: 'L',
      },
      names: [
        {
          index: 'N01',
          firstName,
          middleName,
          lastName,
          birthDate: formattedBirthDate,
          gender: genderCode,
        },
      ],
      ids: [
        {
          index: 'I01',
          idNumber: panNumber,
          idType: '01',
        },
      ],
      telephones: [
        {
          index: 'T01',
          telephoneNumber,
          telephoneType: '01',
        },
      ],
      addresses: [
        {
          index: 'A01',
          line1,
          line2,
          stateCode,
          pinCode,
          addressCategory: '01',
          residenceCode: '01',
        },
      ],
    },
  };
};

const stateCodesMapping = {
  'jammu & kashmir': '01',
  'jammu and kashmir': '01',
  'himachal pradesh': '02',
  punjab: '03',
  chandigarh: '04',
  uttarakhand: '05',
  haryana: '06',
  delhi: '07',
  rajasthan: '08',
  'uttar pradesh': '09',
  bihar: '10',
  sikkim: '11',
  'arunachal pradesh': '12',
  nagaland: '13',
  manipur: '14',
  mizoram: '15',
  tripura: '16',
  meghalaya: '17',
  assam: '18',
  'west bengal': '19',
  jharkhand: '20',
  odisha: '21',
  chhattisgarh: '22',
  'madhya pradesh': '23',
  gujarat: '24',
  'daman & diu': '25',
  'dadra & nagar haveli': '26',
  maharashtra: '27',
  'andhra pradesh': '28',
  karnataka: '29',
  goa: '30',
  lakshadweep: '31',
  kerala: '32',
  'tamil nadu': '33',
  pondicherry: '34',
  'andaman & nicobar islands': '35',
  telangana: '36',
  ladakh: '38',
  'apo address': '99',
};

const genderMapping = {
  'not disclosed': '0',
  female: '1',
  male: '2',
  transgender: '3',
};

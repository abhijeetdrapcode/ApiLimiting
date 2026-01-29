import axios from 'axios';
import { saveCollectionItem, updateCollectionItem } from '../item/item.service';
import { sanitizeMongoKeys } from '../utils/utils';

export const handleSpinMobileTokenProcess = async (
  db,
  projectId,
  enableAuditTrail,
  user,
  tenant,
  headers,
  environment,
  consumerKey,
  consumerSecret,
  spinMobileTokenCollection,
  existingToken,
) => {
  try {
    const url = 'https://api.spinmobile.co/api/analytics/auth/';
    const { data: newTokens } = await axios.post(url, {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    });
    const updatedTokenPayload = {
      access_token: newTokens.token,
      expiry_date: new Date(newTokens.expires * 1000).toISOString(),
      userId: user?.uuid,
      tenantId: tenant?.uuid,
    };
    if (existingToken) {
      await updateCollectionItem(
        db,
        projectId,
        environment,
        enableAuditTrail,
        spinMobileTokenCollection,
        existingToken?.uuid,
        updatedTokenPayload,
        user,
        headers,
      );
    } else {
      await saveCollectionItem(
        db,
        projectId,
        enableAuditTrail,
        spinMobileTokenCollection,
        updatedTokenPayload,
        user,
        headers,
        environment,
      );
    }
    return {
      code: 200,
      message: 'Spin Mobile token fetched successfully',
      token: updatedTokenPayload,
    };
  } catch (error) {
    console.error('Error in handleSpinMobileTokenProcess:', error);
    return {
      code: 500,
      message: 'Error generating Spin Mobile access token',
      error: error?.message || error,
    };
  }
};

export const preparePayloadForEStatementAnalysis = (
  statementFileObject,
  user,
  tenant,
  subTenant,
) => {
  const sanitizedStatement = sanitizeMongoKeys(statementFileObject);
  const { json_data } = sanitizedStatement;
  const { last_data, scores } = json_data;
  const { header, body } = last_data;
  return {
    remote_identifier: sanitizedStatement?.remote_identifier,
    file_unique_id: sanitizedStatement?.file_unique_id,
    file_type: sanitizedStatement?.file_type,
    filename: sanitizedStatement?.filename,
    password: sanitizedStatement?.password,
    email: sanitizedStatement?.email,
    phone: sanitizedStatement?.phone,
    id_number: sanitizedStatement?.id_number,
    bank_name: sanitizedStatement?.bank_name,
    account_number: sanitizedStatement?.account_number,
    duration: sanitizedStatement?.duration,
    timestamp: sanitizedStatement?.timestamp,
    state_name: sanitizedStatement?.state_name,
    total_send_amt: header?.total_send_amt,
    total_received_amt: header?.total_received_amt,
    total_agent_deposit: header?.total_agent_deposit,
    total_agent_withdrawal: header?.total_agent_withdrawal,
    total_lipa_na_mpesa_paybill: header?.total_lipa_na_mpesa_paybill,
    total_lipa_na_mpesa_buygoods: header?.total_lipa_na_mpesa_buygoods,
    total_paid_in: header?.total_paid_in,
    total_paid_out: header?.total_paid_out,
    total_paid_in_average: header?.total_paid_in_average,
    total_paid_out_average: header?.total_paid_out_average,
    total_others: header?.total_others,
    mpesa_balance: header?.mpesa_balance,
    opening_balance: header?.opening_balance,
    kplc_account: body?.kplc_account,
    vehicle_reg_no: body?.vehicle_reg_no,
    highest_location: body?.highest_location,
    customer_bank_account: body?.customer_bank_account,
    loans_data: body?.loans_data,
    locations: body?.locations,
    customers: body?.customers,
    airtime: body?.airtime,
    internet_bundles: body?.internet_bundles,
    fuliza: body?.fuliza,
    small_business: body?.small_business,
    other_products: body?.other_products,
    agent: body?.agent,
    fees: body?.fees,
    paybill: body?.paybill,
    buy_goods: body?.buy_goods,
    kcb_mpesa: body?.kcb_mpesa,
    mshwari: body?.mshwari,
    hustler_fund: body?.hustler_fund,
    international_remmitance: body?.international_remmitance,
    final_classifications: body?.final_classifications,
    monthly_tabulated: body?.monthly_tabulated,
    end_of_day_balances: body?.end_of_day_balances,
    scoring_payload: last_data?.scoring_payload,
    peak_inflow_dates: last_data?.peak_inflow_dates,
    information: last_data?.information,
    boundaries: last_data?.boundaries,
    classifications: json_data?.classifications,
    income: json_data?.income,
    expenditure: json_data?.expenditure,
    other_lines: json_data?.other_lines,
    mobile_mfi_trends: json_data?.mobile_mfi_trends,
    income_flow: json_data?.income_flow,
    expense_flow: json_data?.expense_flow,
    income_expense_tabulated: json_data?.income_expense_tabulated,
    old_scores: json_data?.old_scores,
    spin_score: scores?.spin_score,
    risk_level: scores?.risk_level,
    highest_saf_loan: scores?.highest_saf_loan,
    highest_other_loan: scores?.highest_other_loan,
    affordability: scores?.affordability,
    eliminative_factor: scores?.eliminative_factor,
    rawResponse: sanitizedStatement,
    userId: user?.uuid,
    tenantId: tenant?.uuid,
    subTenantId: subTenant?.uuid,
  };
};

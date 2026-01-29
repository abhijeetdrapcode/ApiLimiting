/* eslint-disable no-prototype-builtins */
import { findOneCollectionService } from '../collection/collection.service';
import { list, processItemById } from '../item/item.service';
import { roleCollectionName, userCollectionName } from '../security/loginUtils';

export const refreshTenantAndLoggedInUser = async (req, res) => {
  console.log('*** Going to refresh Tenant & Current LoggedIn User...:');
  if (req.user && Object.keys(req.user).length) {
    const { db, projectId, user, params, headers } = req;
    const { authorization } = headers;
    const collection = await findOneCollectionService(projectId, userCollectionName);
    let userDataResponse = await processItemById(
      db,
      projectId,
      collection,
      user.uuid,
      authorization,
    );

    if (!userDataResponse || !userDataResponse.data) {
      return res.status(404).json(req.user);
    }
    console.log('userDataResponse :>> ', Object.keys(userDataResponse));
    console.log('params :>> ', params);
    userDataResponse = userDataResponse ? userDataResponse.data : null;
    console.log('userDataResponse :>> ', Object.keys(userDataResponse));
    const updatedUserData = {
      userDetails: userDataResponse,
      role: user.role,
      token: user.token,
    };
    if (
      params &&
      params.tenantId &&
      userDataResponse.hasOwnProperty('tenantId') &&
      userDataResponse.tenantId.length
    ) {
      console.log('I am inside if');
      const { tenantId: paramTenantId } = params;
      const { tenantId: tenants, userSettingId: userSettings } = userDataResponse;
      console.log('tenants :>> ', tenants);

      const currentTenant = tenants.find((tenant) => tenant.uuid === paramTenantId);
      console.log('My current tenant', currentTenant);
      if (currentTenant) {
        updatedUserData['tenant'] = currentTenant;
      }
      console.log('New updatedUserData', Object.keys(updatedUserData));

      if (userSettings && userSettings.length) {
        console.log('I have user setting');
        const currentUserSetting = userSettings.find(
          (setting) =>
            setting?.tenantId[0]?.uuid === paramTenantId &&
            setting?.userId[0]?.uuid === userDataResponse.uuid,
        );
        if (currentUserSetting) {
          console.log('I got current user setting 1');
          updatedUserData['userSetting'] = currentUserSetting;
        }
      } else {
        console.log('I dont have user setting');
        if (params.userSettingId) {
          const { userSettingId: paramUserSettingId } = params;
          if (
            // eslint-disable-next-line no-prototype-builtins
            userDataResponse.hasOwnProperty('userSettingId') &&
            userDataResponse.userSettingId.length
          ) {
            const { userSettingId: userSettings } = userDataResponse;
            const currentSetting = userSettings.find(
              (userSetting) => userSetting.uuid === paramUserSettingId,
            );
            if (currentSetting) {
              console.log('I got current user setting 2');
              updatedUserData['userSetting'] = currentSetting;
            }
          }
        }
      }
    }
    console.log('final updatedUserData', Object.keys(updatedUserData));

    console.log('*** Refreshing Tenant & Current LoggedIn User...:');
    req.logIn(updatedUserData, { session: true }, async (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      req.user.projectId = req.projectId;
      req.user = updatedUserData;
      return res.status(200).json(req.user);
    });
  }
};

export const switchTenant = async (req, res) => {
  console.log('*** Going to switch Tenant...:');
  if (req.user && Object.keys(req.user).length) {
    const { db, projectId, user, params, headers } = req;
    const { authorization } = headers;
    const collection = await findOneCollectionService(projectId, userCollectionName);
    const roleCollection = await findOneCollectionService(projectId, roleCollectionName);
    let userDataResponse = await processItemById(
      db,
      projectId,
      collection,
      user.uuid,
      authorization,
    );
    userDataResponse = userDataResponse ? userDataResponse.data : null;
    if (userDataResponse) {
      console.log('switchTenant ~ userDataResponse:', userDataResponse);
      const userToken = user.token;
      let userRole = user.role;
      let tenantUserSetting = '';
      let subTenant = '';

      if (params && params.tenantId) {
        const { tenantId: paramTenantId } = params;
        console.log('switchTenant ~ paramTenantId:', paramTenantId);
        if (
          // eslint-disable-next-line no-prototype-builtins
          userDataResponse.hasOwnProperty('userSettingId') &&
          userDataResponse.userSettingId.length
        ) {
          const { userSettingId: userSettings } = userDataResponse;
          const currentUserSetting = userSettings.find(
            (setting) =>
              setting?.tenantId[0]?.uuid === paramTenantId &&
              setting?.userId[0]?.uuid === userDataResponse.uuid,
          );
          console.log('currentUserSetting', currentUserSetting);
          if (currentUserSetting) {
            tenantUserSetting = currentUserSetting;
            userDataResponse['userSetting'] = currentUserSetting;
          }
        }
        if (tenantUserSetting.userRoles && tenantUserSetting.userRoles.length) {
          const tenantRoleName = tenantUserSetting?.userRoles?.[0];
          let roleItems = await list(db, projectId, roleCollection);

          if (tenantRoleName && roleItems && roleItems.length) {
            const tenantRole = roleItems.find((role) => role.name === tenantRoleName);
            console.log('switchTenant ~ tenantRole:', tenantRole);
            if (tenantRole) {
              userDataResponse['userRoles'] = [tenantRoleName];
              userRole = tenantRole.uuid;
            }
          }
        }
        if (tenantUserSetting.subTenantId && tenantUserSetting.subTenantId.length) {
          const subTenantIds = tenantUserSetting.subTenantId.filter(
            (subTenant) =>
              subTenant.tenantId?.[0]?.uuid === paramTenantId ||
              subTenant.tenantId[0] === paramTenantId,
          );
          const userSubTenantIds = userDataResponse.subTenantId.filter(
            (subTenant) =>
              subTenant.tenantId?.[0]?.uuid === paramTenantId ||
              subTenant.tenantId[0] === paramTenantId,
          );
          console.log('userSubTenantIds', userSubTenantIds);
          const commonSubTenants = subTenantIds.filter((subTenant) =>
            userSubTenantIds.some((userSubTenant) => userSubTenant.uuid === subTenant.uuid),
          );
          subTenant = commonSubTenants[0] || '';
          console.log('commonSubTenants', subTenant);
        }
      }

      const updatedUserData = {
        userDetails: userDataResponse,
        role: userRole,
        token: userToken,
        userSetting: tenantUserSetting,
        subTenant,
      };

      if (params && params.tenantId) {
        const { tenantId: paramTenantId } = params;
        // eslint-disable-next-line no-prototype-builtins
        if (userDataResponse.hasOwnProperty('tenantId') && userDataResponse.tenantId.length) {
          const { tenantId: tenants } = userDataResponse;
          const currentTenant = tenants.find((tenant) => tenant.uuid === paramTenantId);
          if (currentTenant) {
            updatedUserData['tenant'] = currentTenant;
            userDataResponse['tenant'] = currentTenant;
          }
        }
        if (
          userDataResponse &&
          userDataResponse.subTenantId &&
          userDataResponse.subTenantId.length &&
          !subTenant
        ) {
          const { subTenantId: subTenants } = userDataResponse;
          subTenant = subTenants.find(
            (subTenant) =>
              subTenant?.tenantId[0]?.uuid === paramTenantId ||
              subTenant?.tenantId[0] === paramTenantId,
          );
          if (subTenant) {
            updatedUserData['subTenant'] = subTenant;
            userDataResponse['subTenant'] = subTenant;
          }
        }
      }

      console.log('*** Switching Tenant...:');
      req.logIn(updatedUserData, { session: true }, async (err) => {
        if (err) {
          return res.status(500).json(err);
        }
        req.user.projectId = req.projectId;
        req.user = updatedUserData;
        return res.status(200).json(req.user);
      });
    } else {
      return res.status(404).json(req.user);
    }
  }
};

export const switchSubTenant = async (req, res) => {
  console.log('*** Going to switch Sub Tenant...:');
  if (req.user && Object.keys(req.user).length) {
    const { db, projectId, user, params, headers } = req;
    const { authorization } = headers;
    const collection = await findOneCollectionService(projectId, userCollectionName);
    const roleCollection = await findOneCollectionService(projectId, roleCollectionName);
    let userDataResponse = await processItemById(
      db,
      projectId,
      collection,
      user.uuid,
      authorization,
    );

    userDataResponse = userDataResponse ? userDataResponse.data : null;
    if (userDataResponse) {
      console.log('switchSubTenant ~ userDataResponse:', userDataResponse);
      const userToken = user.token;
      let userRole = user.role;
      let tenantUserSetting = '';
      let tenant = '';
      let subTenant = '';

      if (params && params.subTenantId) {
        const { subTenantId: paramSubTenantId } = params;
        console.log('switchSubTenant ~ paramSubTenantId:', paramSubTenantId);
        // eslint-disable-next-line no-prototype-builtins
        if (userDataResponse.hasOwnProperty('subTenantId') && userDataResponse.subTenantId.length) {
          const { subTenantId: subTenants } = userDataResponse;
          const currentSubTenant = subTenants.find(
            (subTenant) => subTenant.uuid === paramSubTenantId,
          );
          if (currentSubTenant) {
            subTenant = currentSubTenant;
            userDataResponse['subTenant'] = currentSubTenant;
          }
        }
        if (
          // eslint-disable-next-line no-prototype-builtins
          userDataResponse.hasOwnProperty('tenantId') &&
          userDataResponse.tenantId.length &&
          subTenant
        ) {
          const { tenantId: tenants } = userDataResponse;
          const currentTenant = tenants.find(
            (tenant) => tenant?.uuid === subTenant?.tenantId[0]?.uuid,
          );
          if (currentTenant) {
            tenant = currentTenant;
            userDataResponse['tenant'] = currentTenant;
          }
        }
        if (
          // eslint-disable-next-line no-prototype-builtins
          userDataResponse.hasOwnProperty('userSettingId') &&
          userDataResponse.userSettingId.length &&
          subTenant
        ) {
          const { userSettingId: userSettings } = userDataResponse;
          const currentUserSetting = userSettings.find(
            (setting) =>
              setting?.tenantId[0]?.uuid === subTenant?.tenantId[0]?.uuid &&
              setting?.userId[0]?.uuid === userDataResponse.uuid,
          );
          if (currentUserSetting) {
            tenantUserSetting = currentUserSetting;
            userDataResponse['userSetting'] = currentUserSetting;
          }
        }
        if (
          tenantUserSetting &&
          tenantUserSetting.userRoles &&
          tenantUserSetting.userRoles.length
        ) {
          const tenantRoleName = tenantUserSetting?.userRoles?.[0];
          let roleItems = await list(db, projectId, roleCollection);

          if (tenantRoleName && roleItems && roleItems.length) {
            const tenantRole = roleItems.find((role) => role.name === tenantRoleName);
            console.log('switchTenant ~ tenantRole:', tenantRole);
            if (tenantRole) {
              userDataResponse['userRoles'] = [tenantRoleName];
              userRole = tenantRole.uuid;
            }
          }
        }
      }

      const updatedUserData = {
        userDetails: userDataResponse,
        role: userRole,
        token: userToken,
        userSetting: tenantUserSetting,
        tenant,
        subTenant,
      };
      console.log('*** Switching Sub Tenant...:');
      req.logIn(updatedUserData, { session: true }, async (err) => {
        if (err) {
          return res.status(500).json(err);
        }
        req.user.projectId = req.projectId;
        req.user = updatedUserData;
        return res.status(200).json(req.user);
      });
    } else {
      return res.status(404).json(req.user);
    }
  }
};

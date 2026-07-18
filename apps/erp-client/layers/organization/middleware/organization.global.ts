import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
} from 'nuxt/app';
import type { RouteLocationNormalized } from 'vue-router';

import type { OrganizationDto, OrganizationLiteDto } from '@erp/dtos';

import type { OrganizationService } from '../composables/use-organization-service';

import { AppRoute } from '#layers/router';

export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    if (import.meta.server) {
      return;
    }

    const slug: string | null = getOrganizationSlug();

    if (!slug) {
      return;
    }

    const organizationService: OrganizationService = useOrganizationService();

    // The subdomain must point to a real organization — validate before
    // anything else, so even /login is unreachable for an unknown subdomain.
    if (organizationService.publicInfo.value?.slug !== slug) {
      const info: OrganizationLiteDto | null =
        await organizationService.fetchPublic();

      if (!info) {
        return abortNavigation(
          createError({
            statusCode: 404,
            statusMessage: 'Organization not found',
            fatal: true,
          })
        );
      }
    }

    // Public pages are allowed once the organization is known to exist.
    if (to.path === AppRoute.LOGIN || to.path.startsWith('/invite/')) {
      return;
    }

    // Everything else requires membership in this organization.
    if (organizationService.current.value?.slug === slug) {
      return;
    }

    const organization: OrganizationDto | null =
      await organizationService.fetchCurrent();

    if (organization) {
      return;
    }

    return navigateTo(AppRoute.LOGIN);
  }
);

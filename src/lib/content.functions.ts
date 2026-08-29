import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  fetchContactData,
  fetchExperienceData,
  fetchHomeData,
  fetchProjectDetail,
  fetchProjectsData,
} from "./content.server";

export const getHomeData = createServerFn({ method: "GET" }).handler(
  async () => fetchHomeData(),
);

export const getProjectsData = createServerFn({ method: "GET" }).handler(
  async () => fetchProjectsData(),
);

export const getProjectDetail = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => fetchProjectDetail(data.slug));

export const getExperienceData = createServerFn({ method: "GET" }).handler(
  async () => fetchExperienceData(),
);

export const getContactData = createServerFn({ method: "GET" }).handler(
  async () => fetchContactData(),
);

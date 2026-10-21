import crypto from "crypto";

const cuid = () => "c" + crypto.randomBytes(16).toString("hex").slice(0, 23);

const DEMO_PROJECT = {
  id: "demo-project-001",
  name: "Демо-проект",
  description: "Пример проекта для демонстрации платформы",
  channel: "@demo_channel",
  chatUrl: null,
  botUrl: null,
  siteUrl: "https://example.com",
  wave: "Wave 1",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const prisma = {
  project: {
    findMany({ include, orderBy }: { include?: any; orderBy?: any } = {}) {
      const p = { ...DEMO_PROJECT };
      if (include?.posts) Object.assign(p, { posts: [] });
      if (include?.tasks) Object.assign(p, { tasks: [] });
      if (include?.metrics) Object.assign(p, { metrics: [] });
      return [p];
    },
    findUnique({ where, include }: { where: { id: string }; include?: any }) {
      if (where.id !== DEMO_PROJECT.id) return null;
      const p: any = { ...DEMO_PROJECT };
      if (include?.posts) p.posts = [];
      if (include?.tasks) p.tasks = [];
      if (include?.metrics) p.metrics = [];
      return p;
    },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { ...DEMO_PROJECT, ...data, id: where.id };
    },
    delete({ where }: { where: { id: string } }) {
      return { id: where.id };
    },
  },

  post: {
    findUnique({ where }: { where: { id: string } }) { return null; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
  },

  task: {
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
  },

  metric: {
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now };
    },
  },

  experiment: {
    findMany({ where }: { where: { projectId: string } }) { return []; },
    findUnique({ where }: { where: { id: string } }) { return null; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
    delete({ where }: { where: { id: string } }) { return null; },
  },

  campaign: {
    findMany({ where }: { where: { projectId: string } }) { return []; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
    delete({ where }: { where: { id: string } }) { return null; },
  },

  competitor: {
    findMany({ where }: { where: { projectId: string } }) { return []; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
    delete({ where }: { where: { id: string } }) { return null; },
  },

  growth: {
    findMany({ where }: { where: { projectId: string } }) { return []; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
  },

  icp: {
    findMany({ where }: { where: { projectId: string } }) { return []; },
    create({ data }: { data: any }) {
      const now = new Date().toISOString();
      return { id: cuid(), ...data, createdAt: now, updatedAt: now };
    },
    update({ where, data }: { where: { id: string }; data: any }) {
      return { id: where.id, ...data };
    },
    delete({ where }: { where: { id: string } }) { return null; },
  },

  prepare(sql: string) {
    return {
      get: (...params: any[]) => null,
      all: (...params: any[]) => [],
      run: (...params: any[]) => {},
    };
  },

  $disconnect() {},
};

export default prisma;

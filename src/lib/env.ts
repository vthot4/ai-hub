// En producción (servidor Node) las variables están en process.env; en dev/build Astro las expone en import.meta.env.
export const env = (key: string): string | undefined =>
  process.env[key] ?? ((import.meta.env as Record<string, string | undefined>)[key] || undefined);

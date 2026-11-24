import { getCollection } from 'astro:content';

/** Herramientas para las que tiene sentido una excepción: restringidas o que exigen aprobación. */
export async function getExceptionTools() {
  return (await getCollection('tools'))
    .filter((t) => t.data.status === 'restricted' || t.data.requiresApproval)
    .map((t) => ({ id: t.id, name: t.data.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

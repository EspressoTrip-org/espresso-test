import * as manifests from '@journeyapps-platform/kubernetes-manifests';

export = async () => {
  const context = await manifests.context.collectDeployContext();

  return manifests.createDefaultServiceDeployment(context.full_name, {
    environment: context.environment,
    project: context.config.project,
    namespace: context.namespace,
    image: context.image,
    sha: context.sha,

    provider: context.provider
  });
};

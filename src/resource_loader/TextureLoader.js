import AbstractLoader from './AbstractLoader';

import { Texture } from 'three';

export default class TextureLoader extends AbstractLoader
{
  constructor(resource_id, url, size)
  {
    super(resource_id, url, size);
  }

  on_preloaded_finished(resource_container, response)
  {
    response.blob().then((blob) =>
    {
      const texture = new Texture();

      const url = URL.createObjectURL(blob);

      const image = new Image();
      image.src = url;

      image.onload = () =>
      {
        texture.image = image;
        texture.needsUpdate = true;

        resource_container.set_resource(this.resource_id, this.url, texture);

        this.__update_downloaded_bytes(1, 1);
        this.__loading_ended();
      };
    });
  }
}

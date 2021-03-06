import Configuration from './Configuration';
import BaseRender from './render_mode/BaseRender';
import Screen from './Screen';
import CameraManager from './CameraManager';
import SceneManager from './SceneManager';
import Capabilities from './Capabilities';
import DepthAndNormalsRenderer from './render_utilities/DepthAndNormalsRenderer';
import Blitter from './render_utilities/Blitter';

import { WebGLRenderer } from 'three';

class Graphics
{
  init(canvas, context_attributes)
  {
    this._renderer = undefined;
    this.blitter = undefined;
    this.canvas = undefined;
    this.no_render = undefined;
    this.current_render_mode = undefined;
    this.generateDepthNormalTexture = false;
    this.depth_and_normals_renderer = undefined;

    this.is_webgl2 = false;
    this.canvas_context = undefined;
    this.context_attributes = undefined;

    this.context_attributes = context_attributes || {
      alpha: true,
      depth: true,
      desynchronized: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: false
    };

    if (context_attributes.force_webgl2)
    {
      this.canvas_context = canvas.getContext('webgl2', this.context_attributes) ||
                            canvas.getContext('webgl', this.context_attributes) ||
                            canvas.getContext('experimental-webgl', this.context_attributes);
    }
    else
    {
      this.canvas_context = canvas.getContext('webgl', this.context_attributes) ||
                            canvas.getContext('experimental-webgl', this.context_attributes);
    }

    this.is_webgl2 = this.canvas_context.constructor.name === 'WebGL2RenderingContext';

    // console.log(`Using WebGL ${this.is_webgl2 ? 2 : 1}`);

    this._renderer = new WebGLRenderer({
      canvas: canvas,
      context: this.canvas_context
    });
    this._renderer.autoClear = false;

    this._renderer.setPixelRatio(1);

    Screen.dpr = Configuration.dpr;

    if (!this.is_webgl2)
    {
      this._renderer.extensions.get('ANGLE_instanced_arrays');
    }

    this.blitter = new Blitter(this._renderer);

    this.canvas = this._renderer.domElement;

    this.no_render = new BaseRender();

    this.current_render_mode = this.no_render;
    Capabilities.max_anisotropy = this._renderer.capabilities.getMaxAnisotropy();
    Capabilities.vertex_texture_sampler_available = this._renderer.capabilities.maxVertexTextures > 0;
    Capabilities.fp_textures_available = this._renderer.capabilities.floatVertexTextures;

    this.generateDepthNormalTexture = false;

    this.depth_and_normals_renderer = new DepthAndNormalsRenderer();

    this.resize_observer = new ResizeObserver(this.on_resize.bind(this));
    this.resize_observer.observe(this.canvas);
  }

  get dom_element()
  {
    return this._renderer.domElement;
  }

  get depth_normals_RT()
  {
    return this.depth_and_normals_renderer.render_target;
  }

  set_state(new_state)
  {
    // console.log('VIEWAPI - map render mode switch to: ' + new_state.constructor.name);

    this.current_render_mode.on_exit(this, this._renderer);
    this.current_render_mode = new_state;
    this.current_render_mode.on_enter(this, this._renderer);
  }

  update()
  {
    if (this.generateDepthNormalTexture)
    {
      this.depth_and_normals_renderer.render(this);
    }

    this.__update_current_camera();

    if (CameraManager.current)
    {
      this.current_render_mode.render();
    }

    Screen.update();
  }

  __update_current_camera()
  {
    if (CameraManager.current)
    {
      CameraManager.current.aspect = Screen.aspect_ratio;
      CameraManager.current.updateProjectionMatrix();
      CameraManager.current.updateMatrix();
      CameraManager.current.updateMatrixWorld(true);
    }
  }

  render(scene, camera, RT, override_mat)
  {
    this.__apply_override_material(scene, override_mat);

    this._renderer.setRenderTarget(RT === undefined ? null : RT);
    this._renderer.render(scene  || SceneManager.current,
      camera || CameraManager.current);

    this.__apply_override_material(scene, undefined);
  }

  render_scene(scene)
  {
    if (scene.on_pre_render)
    {
      scene.on_pre_render();
    }

    if (scene.render)
    {
      scene.render();
    }
    else
    {
      this.render(scene, undefined);
    }

    if (scene.on_post_render)
    {
      scene.on_post_render();
    }
  }

  __apply_override_material(scene, mat)
  {
    mat = mat === undefined ? null : mat;
    if (scene)
    {
      scene.overrideMaterial = mat;
    }
    else
    {
      SceneManager.current.overrideMaterial = mat;
    }
  }

  readback_RT(RT, buffer)
  {
    this._renderer.readRenderTargetPixels(RT, 0, 0, RT.width, RT.height, buffer);
  }

  clear(RT, camera, clear_depth, clear_stencil)
  {
    this._renderer.setRenderTarget(RT === undefined ? null : RT);

    if (camera)
    {
      this._renderer.setClearColor(camera.clear_color, camera.clear_alpha);
    }

    this._renderer.clear(!!camera, // clear color
      !!clear_depth,
      !!clear_stencil);
  }

  on_resize(entries)
  {
    for (let entry of entries)
    {
      Screen.dpr = Configuration.dpr;
      Screen.update_position(entry.contentRect.x, entry.contentRect.y);
      Screen.update_size(entry.contentRect.width, entry.contentRect.height);

      this.canvas.width  = Screen.render_width;
      this.canvas.height = Screen.render_height;

      this._renderer.setViewport(0, 0, Screen.render_width, Screen.render_height);

      this.__update_current_camera();
    }
  }

  material_pass(mat, dst)
  {
    this.blitter.material_pass(mat, dst);
  }

  blit(src_RT, dst_RT, mat)
  {
    if (mat)
    {
      this.blitter.blit_with_material(src_RT, dst_RT, mat);
    }
    else
    {
      this.blitter.blit(src_RT, dst_RT);
    }
  }

  blit_clear_with_material(dst_RT, mat)
  {
    this.blitter.blit_clear_with_material(dst_RT, mat);
  }

  take_screenshot(blob_callback, width = Screen.width, height = Screen.height)
  {
    // const ctx = this;

    let old_width = Screen.width;
    let old_height = Screen.height;

    let new_width = width;
    let new_height = height;

    let tile_width = 1024;
    let tile_height = 1024;

    let divisions_x = parseInt(Math.ceil(new_width / tile_width));
    let divisions_y = parseInt(Math.ceil(new_height / tile_height));

    Screen.update_size(tile_width, tile_height);

    this._renderer.setPixelRatio(1);

    this._renderer.setSize(tile_width, tile_height, false);

    let canvas_2d = document.createElement('canvas');
    let ctx_2D = canvas_2d.getContext('2d');

    ctx_2D.canvas.width  = new_width;
    ctx_2D.canvas.height = new_height;

    CameraManager.current.aspect = Screen.aspect_ratio;
    CameraManager.current.updateMatrix();
    CameraManager.current.updateMatrixWorld(true);

    for (let x = 0; x < divisions_x; x++)
    {
      for (let y = 0; y < divisions_y; y++)
      {
        CameraManager.current.setViewOffset(new_width,             new_height,
          Screen.width * x,         Screen.height * y,
          Screen.width,            Screen.height);
        this.current_render_mode.render();

        ctx_2D.drawImage(this._renderer.domElement, Screen.width * x, Screen.height * y);
      }
    }

    // transform the result canvas into a blob
    // from them the callback turns into a ULR and download it
    ctx_2D.canvas.toBlob(blob_callback, 'image/png;base64;');

    CameraManager.current.clearViewOffset();

    Screen.update_size(old_width, old_height);
    this._renderer.setPixelRatio(Configuration.dpr);
    this._renderer.setSize(old_width, old_height, false);

    CameraManager.current.aspect = Screen.aspect_ratio;
    CameraManager.current.updateMatrix();
    CameraManager.current.updateMatrixWorld(true);
  }

  download_screenshot(blob)
  {
    let link = document.createElement('a');
    link.download = 'Snapshot.png';

    link.href = URL.createObjectURL(blob);
    link.click();

    link.onclick = function()
    {
      requestAnimationFrame(function()
      {
        URL.revokeObjectURL(link.href);
      });
      link.removeAttribute('href');
    };
  }

  dispose()
  {
    this._renderer.dispose();
    this.current_render_mode.dispose();
    this.blitter.dispose();
  }
}

export default new Graphics();

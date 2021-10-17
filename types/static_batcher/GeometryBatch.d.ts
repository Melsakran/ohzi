export class GeometryBatch {
    constructor(geometry: any, batch_width: any);
    geometry: any;
    material: any;
    uniforms: {};
    batch_width: any;
    data_textures: any[];
    object_names: any;
    zero_offset: any;
    write_offset: any;
    uniform_dirty_count: number;
    tmp_uploaded_data_count: number;
    init(object_names: any, vert_shader: any, frag_shader: any): void;
    add_global_uniform(name: any, data: any): void;
    set_global_uniform(name: any, data: any): void;
    add_object_uniform_v3(uniform_name: any, default_value_v3: any): void;
    add_object_uniform_v4(uniform_name: any, default_value_v4: any): void;
    add_object_uniform_v4_float(uniform_name: any, default_value_v4: any): void;
    set_object_uniform_v3(object_name: any, uniform_name: any, vector3: any, use_r: any, use_g: any, use_b: any): void;
    set_object_uniform_v4(object_name: any, uniform_name: any, vector4: any, use_r: any, use_g: any, use_b: any, use_a: any): void;
    upload_texture_data(renderer: any, upload_budget: any): void;
    get_uniform_dirty_count(): number;
    __full_texture_data_upload(renderer: any, texture_data: any): void;
    __partial_texture_data_upload(renderer: any, texture_data: any): void;
    get_mesh(): any;
    __set_pixel_rgb(data_texture: any, index: any, vector3: any, use_r: any, use_g: any, use_b: any): void;
    __set_pixel_rgba(data_texture: any, index: any, vector4: any, use_r: any, use_g: any, use_b: any, use_a: any): void;
    __flood_data_texture_rgb(data_texture: any, v3: any): void;
    __flood_data_texture_rgba(data_texture: any, v4: any): void;
    __create_rgb_texture(width: any): any;
    __create_rgba_texture(width: any): any;
    __create_rgba_float_texture(width: any): any;
    __get_data_texture(uniform_name: any): any;
    __get_object_index(name: any): number;
    __add_data_texture(uniform_name: any, src_texture: any, dst_texture: any, one_pixel_text: any): any;
    dispose(): void;
}
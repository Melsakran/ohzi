declare var _default: CameraUtilities;
export default _default;
declare class CameraUtilities {
    init(): void;
    tmp_mat: any;
    tmp_vec: any;
    tmp_vec2: any;
    plane: any;
    ray: any;
    tmp_size: any;
    tmp_unproj: any;
    get_up_dir(camera: any): any;
    get_forward_dir(camera: any): any;
    get_right_dir(camera: any): any;
    unproject_mouse_position(NDC: any, camera: any): any;
    get_plane_intersection(plane_position: any, plane_normal: any, NDC: any, camera: any): any;
    fit_points_on_camera(points: any, zoom_scale?: number): {
        position: any;
        zoom: number;
    };
    get_zoom_to_fit_rect(width: any, height: any): number;
    get_zoom_to_fit_box(bb: any, camera: any): number;
    get_html_screen_pos(object: any, camera: any): any;
    world_pos_to_screen(pos: any, camera: any): any;
    update_projection(camera: any): void;
}

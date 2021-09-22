export class BaseApplication {
    on_post_start(): void;
    on_enter(): void;
    on_exit(): void;
    update(): void;
    on_post_render(): void;
    on_pre_render(): void;
}

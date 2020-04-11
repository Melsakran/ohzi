class Capabilities
{
	constructor()
	{
		this.max_anisotropy = 0;
		this.vertex_texture_sampler_available = false;
		this.fp_textures_available = false;
	}
}

const capabilities = new Capabilities();
module.exports = capabilities;

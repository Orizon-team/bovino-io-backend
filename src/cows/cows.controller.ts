import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { VacasService } from './cows.service';
import { CreateVacaInput } from './dto/create-cow.input';
import upload, { storage } from '../utils/cloudinaryConfig';

@Controller('cows')
export class VacasController {
  constructor(private readonly vacasService: VacasService) {}

  // Accept multipart/form-data with fields of CreateVacaInput and a file field named 'imagen'
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  async createWithImage(@Body() body: CreateVacaInput, @UploadedFile() file: MulterFile) {
    try {
      // file may be undefined if no file sent
      let url: string | null = null;
      if (file) {
        // multer-storage-cloudinary commonly sets file.path to the secure URL
        url = (file as any).path || (file as any).secure_url || (file as any).url || null;
        if (!url) throw new BadRequestException('No se pudo obtener la URL de Cloudinary');
      }

      // Normalize incoming form-data keys to the service DTO/entity shape.
      const payload: any = {};
      // tag_id: accept tag_id (PK) or tag (alias)
      const rawTag = (body as any).tag_id ?? (body as any).tag;
      payload.tag_id = rawTag ? Number(rawTag) : undefined;
      // name: accept english 'name' or spanish 'nombre'
      payload.name = (body as any).name ?? (body as any).nombre;
      // id_user: accept id_user or id_usuario
      const rawUser = (body as any).id_user ?? (body as any).id_usuario;
      payload.id_user = rawUser ? Number(rawUser) : undefined;
      // favorite_food
      payload.favorite_food = (body as any).favorite_food ?? (body as any).comida_preferida;
      // image: prefer uploaded url, fallback to body.image/body.imagen
      payload.imagen = url ?? (body as any).image ?? (body as any).imagen;

      // Validate required fields before calling service
      if (!payload.tag_id) throw new BadRequestException('tag_id is required');
      if (!payload.name) throw new BadRequestException('name is required');

      return this.vacasService.create(payload);
    } catch (e) {
      throw e;
    }
  }
}

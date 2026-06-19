import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      throw new BadRequestException({
        message: '유효성 검증 실패',
        errors,
      });
    }

    return result.data;
  }
}

export function createZodDto(schema: z.ZodSchema) {
  return class ZodDto {
    constructor(data: unknown) {
      const result = schema.safeParse(data);
      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        throw new BadRequestException({
          message: '유효성 검증 실패',
          errors,
        });
      }
      Object.assign(this, result.data);
    }
  };
}
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationError {
  property: string;
  value?: any;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  errors?: ValidationError[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ErrorResponse;

    if (
      status === 400 &&
      Array.isArray(exceptionResponse.message)
    ) {
      const formattedErrors = this.formatValidationErrors(
        exceptionResponse.message,
      );

      return response.status(status).json({
        statusCode: status,
        message: 'Ошибка валидации',
        error: 'Bad Request',
        errors: formattedErrors,
      });
    }

    const message = this.translateMessage(exceptionResponse.message as string);
    
    response.status(status).json({
      statusCode: status,
      message: message,
      error: exceptionResponse.error || exception.name,
    });
  }

  private formatValidationErrors(messages: string[]): ValidationError[] {
    const errorMap = new Map<string, ValidationError>();

    messages.forEach((message) => {
      const parts = message.split(' ');
      if (parts.length >= 2) {
        const property = parts[0];
        const constraintMessage = parts.slice(1).join(' ');
        
        if (!errorMap.has(property)) {
          errorMap.set(property, {
            property,
            constraints: {},
          });
        }

        const error = errorMap.get(property)!;
        const constraintKey = this.getConstraintKey(constraintMessage);
        error.constraints![constraintKey] = this.translateValidationMessage(
          property,
          constraintMessage,
        );
      } else {
        if (!errorMap.has('general')) {
          errorMap.set('general', {
            property: 'general',
            constraints: {},
          });
        }
        errorMap.get('general')!.constraints!['general'] = message;
      }
    });

    return Array.from(errorMap.values());
  }

  private getConstraintKey(message: string): string {
    if (message.includes('must be')) return 'isValid';
    if (message.includes('should not be empty')) return 'isNotEmpty';
    if (message.includes('must be a string')) return 'isString';
    if (message.includes('must be an email')) return 'isEmail';
    if (message.includes('must be longer')) return 'minLength';
    if (message.includes('must be shorter')) return 'maxLength';
    if (message.includes('must be a boolean')) return 'isBoolean';
    return 'custom';
  }

  private translateValidationMessage(
    property: string,
    message: string,
  ): string {
    const propertyTranslations: Record<string, string> = {
      email: 'Email',
      password: 'Пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      nickName: 'Никнейм',
      bio: 'Биография',
      title: 'Заголовок',
      content: 'Содержание',
      isPublic: 'Публичность',
    };

    const propertyName = propertyTranslations[property] || property;

    if (message.includes('should not be empty') || message.includes('must not be empty') || message.includes('isNotEmpty')) {
      return `${propertyName} не может быть пустым`;
    }
    if (message.includes('must be a string') || message.includes('isString')) {
      return `${propertyName} должен быть строкой`;
    }
    if (message.includes('must be an email') || message.includes('isEmail')) {
      return `${propertyName} должен быть валидным email адресом`;
    }
    if (message.includes('must be longer than') || message.includes('minLength')) {
      const match = message.match(/must be longer than (\d+)/) || message.match(/minLength (\d+)/) || message.match(/minimum is (\d+)/);
      const length = match ? match[1] : '';
      if (length) {
        return `${propertyName} должен содержать минимум ${length} символов`;
      }
      return `${propertyName} слишком короткий`;
    }
    if (message.includes('must be shorter than') || message.includes('maxLength')) {
      const match = message.match(/must be shorter than (\d+)/) || message.match(/maxLength (\d+)/) || message.match(/maximum is (\d+)/);
      const length = match ? match[1] : '';
      if (length) {
        return `${propertyName} должен содержать максимум ${length} символов`;
      }
      return `${propertyName} слишком длинный`;
    }
    if (message.includes('must be a boolean') || message.includes('isBoolean')) {
      return `${propertyName} должен быть булевым значением (true/false)`;
    }

    return message;
  }

  private translateMessage(message: string): string {
    const translations: Record<string, string> = {
      'User not found': 'Пользователь не найден',
      'User with this email or nickname already exists': 'Пользователь с таким email или никнеймом уже существует',
      'Invalid credentials': 'Неверные учетные данные',
      'Refresh token not provided': 'Refresh токен не предоставлен',
      'Invalid refresh token': 'Неверный refresh токен',
      'Post not found': 'Пост не найден',
      'You do not have access to this post': 'У вас нет доступа к этому посту',
      'You can only update your own posts': 'Вы можете обновлять только свои посты',
      'You can only delete your own posts': 'Вы можете удалять только свои посты',
      'Nickname is already taken': 'Никнейм уже занят',
      'Unauthorized': 'Не авторизован',
      'Forbidden': 'Доступ запрещен',
    };

    return translations[message] || message;
  }
}


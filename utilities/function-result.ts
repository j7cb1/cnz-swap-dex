import { z } from 'zod';

export type FunctionResult<TData, TError> =
    | {
            data: TData;
            error: null;
      }
    | {
            data: null;
            error: TError;
      };

export function success<TData, TError>(
    data: TData
): FunctionResult<TData, TError> {
    return {
        data,
        error: null,
    };
}

export function err<TData, TError>(
    error: TError
): FunctionResult<TData, TError> {
    return {
        data: null,
        error,
    };
}

export const ResultDefaultErrorSchema = z
    .object({
        message: z.string(),
    })
    .passthrough();

export function createResultSchema<
    TDataSchema extends z.ZodType,
    TErrorSchema extends z.ZodType,
>(dataSchema: TDataSchema, errorSchema: TErrorSchema) {
    const schema = z.union([
        z.object({
            data: dataSchema,
            error: z.null(),
        }),
        z.object({
            data: z.null(),
            error: errorSchema,
        }),
    ]);

    // Add helper methods to the schema
    return Object.assign(schema, {
        success: (data: z.infer<TDataSchema>) =>
            ({
                data,
                error: null,
            }) as z.infer<typeof schema>,

        error: (error: z.infer<TErrorSchema>) =>
            ({
                data: null,
                error,
            }) as z.infer<typeof schema>,
    });
}

type ResultSchemaBase = z.ZodUnion<readonly [z.ZodObject<any>, z.ZodObject<any>]> & {
    success: (data: any) => any;
    error: (error: any) => any;
};

export type ZodFunctionResult<T extends ResultSchemaBase> = z.infer<T>;
import { Embarque } from "@/types/embarques";
import supabase from "@/config/supabase";
import { ApiResult } from "@/types/types";

export const index = async () => {
    const { data: Embarques, error } = await supabase().from('embarques').select('*');

    if (error) {
        console.error("Error en la consult", error)
        throw error;
    }

    return Embarques;
}

export const show = async (id: number) => {
    const { data: Embarque, error } = await supabase()
        .from('embarques')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching Embarques: ", error);
        throw error;
    }
    return Embarque
}

export const create = async (embarque_data: Embarque): Promise<ApiResult> => {

    const newEmbarque = {
        descripcion: embarque_data.descripcion
    }

    const { error: uploadError, data: data } = await supabase()
        .from('embarques')
        .insert(newEmbarque)
        .select('*')
        .single();

    if (uploadError) {
        console.log({ uploadError });
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        };
        return error;
    }

    const result: ApiResult = {
        data,
        message: 'Embarque creado con éxito',
        status: true
    };
    return result;
}

export const update = async (payload: Embarque, embarque_id: number): Promise<ApiResult> => {

    const { error: uploadError, data: data } = await supabase()
        .from('embarques')
        .update({ ...payload, last_update: new Date().toISOString() })
        .eq('id', embarque_id)
        .single();

    if (uploadError) {
        console.error("Error updating embarque: ", uploadError.message)
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        };
        return error;
    }
    const result: ApiResult = {
        data,
        message: 'Embarque actualizado con éxito',
        status: true
    };
    return result;
}

export const eliminarEmbarque = async (embarque_id: number): Promise<ApiResult> => {

    const { error: uploadError } = await supabase().from('embarques').delete().eq('id', embarque_id);

    if (uploadError) {
        console.error("Error deleting embarque: ", uploadError.message)
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error
    }

    const result: ApiResult = {
        data: null,
        message: "Embarque eliminado con éxito",
        status: true
    }
    return result;

}
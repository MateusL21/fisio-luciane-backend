import { z } from "zod";

export const createAppointmentSchema = z.object({
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  problem: z.string().min(5, "Descreva melhor o problema"),
  address: z.string().min(5, "Endereço inválido"),
});

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>;
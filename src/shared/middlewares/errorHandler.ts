import { Request, Response, NextFunction } from "express";
import { ZodError, treeifyError } from "zod";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Se for erro do Zod (validação), usa treeifyError
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação",
      errors: treeifyError(error)
    });
  }

  // Log do erro no servidor (para debug)
  console.error(`[${new Date().toISOString()}] Erro:`, error);

  // Erro genérico do servidor
  return res.status(500).json({
    message: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { details: error.message })
  });
}
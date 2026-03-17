import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Função para formatar erros do Zod de forma compatível
function formatZodError(error: ZodError) {
  try {
    // Tenta usar treeifyError se disponível (versões mais novas)
    const { treeifyError } = require('zod');
    return treeifyError(error);
  } catch {
    // Fallback para formato manual (versões mais antigas)
    const issues = (error as any).issues || (error as any).errors || [];
    
    const formatted: any = {
      errors: [],
      properties: {}
    };

    issues.forEach((issue: any) => {
      const path = issue.path?.join('.') || 'root';
      if (!formatted.properties[path]) {
        formatted.properties[path] = { errors: [] };
      }
      formatted.properties[path].errors.push(issue.message);
    });

    return formatted;
  }
}

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  
  // 1️⃣ Erros de validação do Zod
  if (error instanceof ZodError) {
    const issues = (error as any).issues || (error as any).errors || [];
    console.warn(`[${timestamp}] Validação falhou:`, issues);
    
    return res.status(400).json({
      success: false,
      message: "Erro de validação",
      errors: formatZodError(error),
      timestamp
    });
  }

  // 2️⃣ Erros com status code personalizado
  if (error.status && typeof error.status === 'number') {
    console.error(`[${timestamp}] Erro ${error.status}:`, error.message);
    
    return res.status(error.status).json({
      success: false,
      message: error.message || "Erro na requisição",
      ...(process.env.NODE_ENV === "development" && { 
        details: error.stack,
        timestamp 
      })
    });
  }

  // 3️⃣ Erros do Prisma (banco de dados)
  if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    console.error(`[${timestamp}] Erro no banco de dados:`, {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    return res.status(500).json({
      success: false,
      message: "Erro no banco de dados",
      ...(process.env.NODE_ENV === "development" && { 
        details: error.message,
        code: error.code,
        meta: error.meta,
        timestamp
      })
    });
  }

  // 4️⃣ Erros de rede/axios
  if (error.isAxiosError || error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
    console.error(`[${timestamp}] Erro de rede:`, error.message);
    
    return res.status(503).json({
      success: false,
      message: "Serviço indisponível. Tente novamente mais tarde.",
      ...(process.env.NODE_ENV === "development" && { 
        details: error.message,
        code: error.code,
        timestamp
      })
    });
  }

  // 5️⃣ Erros de sintaxe JSON
  if (error instanceof SyntaxError && 'body' in error) {
    console.error(`[${timestamp}] Erro de sintaxe JSON:`, error.message);
    
    return res.status(400).json({
      success: false,
      message: "Formato de dados inválido",
      ...(process.env.NODE_ENV === "development" && { 
        details: error.message,
        timestamp
      })
    });
  }

  // 6️⃣ Log de outros erros não tratados
  console.error(`[${timestamp}] Erro não tratado:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...error
  });

  // 7️⃣ Erro genérico (fallback)
  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { 
      details: error.message,
      stack: error.stack,
      timestamp
    })
  });
}
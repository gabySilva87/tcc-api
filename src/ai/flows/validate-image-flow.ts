'use server';
/**
 * @fileOverview Um fluxo de IA para validar a qualidade da imagem de prova de entrega.
 *
 * - validateImage - Uma função que verifica se a imagem é adequada.
 * - ValidateImageInput - O tipo de entrada para a função.
 * - ValidateImageOutput - O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ValidateImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Uma foto da entrega, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<dados_codificados>'."
    ),
});
export type ValidateImageInput = z.infer<typeof ValidateImageInputSchema>;

const ValidateImageOutputSchema = z.object({
  isValid: z.boolean().describe('Se a imagem é ou não de qualidade aceitável.'),
  reason: z.string().describe('A razão pela qual a imagem não é válida (ex: "A imagem está muito borrada", "A imagem está escura demais", "O objeto não está claramente visível"). Se a imagem for válida, este campo deve estar vazio.'),
});
export type ValidateImageOutput = z.infer<typeof ValidateImageOutputSchema>;

export async function validateImage(input: ValidateImageInput): Promise<ValidateImageOutput> {
  return validateImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateImagePrompt',
  input: { schema: ValidateImageInputSchema },
  output: { schema: ValidateImageOutputSchema },
  prompt: `Você é um sistema de verificação de qualidade para fotos de prova de entrega.
Sua tarefa é analisar a imagem fornecida e determinar se ela é nítida, bem iluminada e se o objeto (a encomenda) está claramente visível.

- Se a imagem estiver borrada, defina isValid como false e a razão como "A imagem está muito borrada".
- Se a imagem estiver muito escura ou superexposta, defina isValid como false e a razão como "A imagem está com pouca ou muita luz".
- Se o pacote não estiver claramente visível, defina isValid como false e a razão como "O pacote não está claramente visível na foto".
- Se a imagem for de boa qualidade para uma prova de entrega, defina isValid como true.

Analise a seguinte imagem: {{media url=photoDataUri}}`,
});

const validateImageFlow = ai.defineFlow(
  {
    name: 'validateImageFlow',
    inputSchema: ValidateImageInputSchema,
    outputSchema: ValidateImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

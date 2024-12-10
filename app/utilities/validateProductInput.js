const { z } = require("zod");

const ProductSchema = z.object({
  product_id: z.string().optional(), // Optional
  product_name: z.string().optional(), // Optional
  description: z.string().optional(), // Optional
  category_id: z.string().optional(), // Optional
  manufacturer_id: z.string().optional(), // Optional
  creation_time: z.string().optional(), // Optional
  specifications: z
    .object({
      material: z.string().optional(),
      size_range: z.string().optional(),
      color: z.string().optional(),
      fit: z.string().optional(),
    })
    .optional(),
  photos: z.array(z.string().url("Invalid photo URL")).optional(), // Optional
});

function validateProductInput(data) {
  const result = ProductSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.errors.map((err) => err.message).join(", "));
  }
  return result.data;
}

module.exports = validateProductInput;

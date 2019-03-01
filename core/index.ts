/*
 * MULTI-CHANNEL SIGNED DISTANCE FIELD GENERATOR v1.5 (2017-07-23)
 * ---------------------------------------------------------------
 * A utility by Viktor Chlumsky, (c) 2014 - 2017
 *
 * The technique used to generate multi-channel distance fields in this code
 * has been developed by Viktor Chlumsky in 2014 for his master's thesis,
 * "Shape Decomposition for Multi-Channel Distance Fields". It provides improved
 * quality of sharp corners in glyphs and other 2D shapes in comparison to monochrome
 * distance fields. To reconstruct an image of the shape, apply the median of three
 * operation on the triplet of sampled distance field values.
 *
 */

export * from "./arithmetics";
export * from "./Bitmap";
export * from "./Contour";
export * from "./edge-coloring";
export * from "./edge-segments";
export * from "./EdgeColor";
export * from "./EdgeHolder";
export * from "./equation-solver";
export * from "./Shape";
export * from "./SignedDistance";
export * from "./Vector2";
export * from "./render-sdf";

export { MSDFGEN_VERSION as VERSION };
export const MSDFGEN_VERSION: string = "1.5";

export * from "./msdfgen";

import type { NextApiRequest, NextApiResponse } from "next";
import { serverEnv } from "../../env/schema.mjs";
import * as z from "zod";

type RequestBody = {
  input: string;
};

type OpenAIModerationResponse = {
  id: string;
  model: string;
  results: [
    {
      categories: {
        hate: boolean;
        "hate/threatening": boolean;
        "self-harm": boolean;
        sexual: boolean;
        "sexual/minors": boolean;
        violence: boolean;
        "violence/graphic": boolean;
      };
      category_scores: {
        hate: number;
        "hate/threatening": number;
        "self-harm": number;
        sexual: number;
        "sexual/minors": number;
        violence: number;
        "violence/graphic": number;
      };
      flagged: boolean;
    }
  ];
};

enum ModronRecommentation {
  safe = "safe",
  flag = "flag",
  unsafe = "unsafe",
}

export type ModronResponse = {
  recommendation: ModronRecommentation;
  input: string;
  raw: OpenAIModerationResponse;
};

const schema = z.object({
  input: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const parsedBody: RequestBody = schema.parse(req.body);

    const { input } = parsedBody;

    const customResponse = await getModerationRecommendation(input);

    res.status(200).json(customResponse);
  } catch (err) {
    res.status(400).json(err);
  }
}

export async function getModerationRecommendation(
  input: string
): Promise<ModronResponse> {
  console.info(input);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: OpenAIModerationResponse = await fetch(
    "https://api.openai.com/v1/moderations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverEnv.OPEN_AI_KEY || ""}`,
      },
      body: JSON.stringify({ input }),
    }
  )
    .then((response) => response.json())
    .catch((err) => {
      throw err;
    });

  const customResponse: ModronResponse = {
    recommendation: getRecommendation(data),
    input: input,
    raw: data,
  };

  console.info(customResponse);

  return customResponse;
}
// given an OpenAIModerationResponse, create a function that returns a ModronRecommentation
// if any category is true or the sum of the category_scores is greater than 2, return unsafe
// if the sum of the category_scores is greater than 1 or any single category is above 0.5, return flag
// otherwise return safe
function getRecommendation(
  response: OpenAIModerationResponse
): ModronRecommentation {
  const { category_scores, categories } = response.results[0];
  const sum = Object.values(category_scores).reduce((a, b) => a + b, 0);

  if (sum > 2 || Object.values(categories).includes(true)) {
    return ModronRecommentation.unsafe;
  }

  if (sum > 1 || Object.values(category_scores).some((cat) => cat > 0.5)) {
    return ModronRecommentation.flag;
  }

  return ModronRecommentation.safe;
}

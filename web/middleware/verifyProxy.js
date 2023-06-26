import crypto from "crypto";

const verifyProxy = (req, res, next) => {
  const { signature } = req.query;
  // console.log(signature);
  // console.log(req._parsedUrl.query);

  const queryURI = req._parsedUrl.query
    .replace("/?", "")
    .replace(/&signature=[^&]*/, "")
    .split("&")
    .map((x) => decodeURIComponent(x))
    .sort()
    .join("");

  // console.log(queryURI);

  const calculatedSignature = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(queryURI, "utf-8")
    .digest("hex");

  // console.log(calculatedSignature);

  if (calculatedSignature === signature) {
    next();
  } else {
    res.send(401);
  }
};

export default verifyProxy;

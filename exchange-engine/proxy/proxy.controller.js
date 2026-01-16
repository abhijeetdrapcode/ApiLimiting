import axios from 'axios';

export const proxyImages = async (req, res) => {
  const { body } = req;
  const { imageUrls } = body;
  if (!Array.isArray(imageUrls)) {
    return res.status(400).send('Invalid request: imageUrls must be an array');
  }

  try {
    const images = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = `data:${response.headers['content-type']};base64,${Buffer.from(
          response.data,
        ).toString('base64')}`;
        return { url, base64 };
      }),
    );

    res.status(200).send(images);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching images');
  }
};

export async function createArtistController(req, res) {
  try {
    const body = await getRequestBody(req);
    const {
      name,
      dob,
      gender,
      address,
      first_release_date,
      no_of_albums_released,
    } = body;

    console.log("Received artist data:", body);
  } catch (error) {}
}

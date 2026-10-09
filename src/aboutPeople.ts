// Add the real names, biographies and publicly hosted portrait URLs here.
// Empty names and portraits display the role and a neutral profile illustration.
export type AboutPerson = {
  name: string
  role: string
  image: string
  bio: string
  focus: string[]
  website?: string
  contacts: {
    platform: "whatsapp" | "email" | "linkedin"
    value: string
  }[]
}

export const founder: AboutPerson = {
  name: "Mamphogoro Muano",
  role: "Founder & CEO",
  image: "",
  bio: "Mamphogoro Muano is the founder and CEO of MUMUS PROPERTYS, guiding the business with a focus on reliable sourcing, responsive service and lasting client relationships.",
  focus: ["Company leadership", "Client relationships"],
  contacts: [
    { platform: "linkedin", value: "https://www.linkedin.com/in/muano-mamphogoro-1a5799133/" },
    { platform: "email", value: "muanomamphogoro@gmail.com" },
  ],
}

export const websiteCreator: AboutPerson = {
  name: "Mudau Rotondwa Agriment",
  role: "Website Creator",
  image: "https://ihpbniqzqrrucnbzdnit.supabase.co/storage/v1/object/public/images/NDAAAA%20(2).PNG",
  bio: "Mudau Rotondwa Agriment is the creator of the MUMUS website, combining thoughtful design and development to deliver an accessible digital experience for the business and its clients.",
  focus: ["Design & development", "Digital experience"],
  contacts: [
    { platform: "whatsapp", value: "+27646243837" },
    { platform: "email", value: "rotondwa0902@gmail.com" },
    { platform: "linkedin", value: "https://www.linkedin.com/in/mudau-rotondwa-agriment-924987383" },
  ],
}

export interface Pet {
  id: string;
  name: string;
  image: string;
  food: string;
}

export const mockPets: Pet[] = [
  {
    id: "1",
    name: "Rocky",
    image: "/img/Dalmata.png",
    food: "Advance Perro Adulto",
  },
  {
    id: "2",
    name: "Mishi",
    image: "/img/GatoC.png",
    food: "Gati Adulto",
  },
];

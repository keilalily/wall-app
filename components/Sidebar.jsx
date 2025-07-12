import { details } from "../data/data";

export default function Sidebar() {
    return (
        <div className="w-full md:w-1/3 p-4 md:p-8 bg-gray-100 rounded flex md:flex-col items-center gap-4">
            <img
                src="/placeholder-photo.jpg"
                alt="Profile"
                className="w-16 md:w-3/4 rounded-full"
            />
            <div className="flex flex-col items-center md:gap-2">
                <h2 className="text-2xl text-center text-black font-bold">{details.name}</h2>
                <p className="text-lg text-center text-gray-800">{details.location}</p>
            </div>
            <p className="hidden md:flex text-gray-700 text-center text-base">{details.description}</p>
        </div>
    )
}

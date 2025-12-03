import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ProfileTab({ user }) {
	return (
		<Card className="mx-auto mt-6 max-w-3xl rounded-lg border border-gray-100 shadow-md">
			<CardHeader className="pb-2">
				<CardTitle className="text-primary text-xl font-bold">Mon profil</CardTitle>
				<div className="my-2 border-t border-gray-200"></div>
			</CardHeader>
			<CardContent>
				<div className="space-y-8">
					<div className="flex flex-col items-center">
						<div className="group relative mb-4 h-32 w-32 overflow-hidden rounded-full">
							<div className="flex h-full w-full items-center justify-center bg-gray-50">
								<span className="text-muted-foreground">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="48"
										height="48"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
										<circle cx="12" cy="7" r="4"></circle>
									</svg>
								</span>
							</div>

							{/* Overlay for hover effect */}
							<div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
									<polyline points="17 8 12 3 7 8"></polyline>
									<line x1="12" y1="3" x2="12" y2="15"></line>
								</svg>
							</div>
						</div>

						<div className="flex flex-col items-center gap-1">
							<Button
								variant="outline"
								size="sm"
								className="bg-background3 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="mr-2"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
									<polyline points="17 8 12 3 7 8"></polyline>
									<line x1="12" y1="3" x2="12" y2="15"></line>
								</svg>
								Changer la photo
							</Button>
							<span className="mt-1 text-xs text-gray-500">JPG, PNG ou GIF, max 2MB</span>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						<div>
							<label htmlFor="lastName" className="mb-1 pl-2 text-sm font-medium">
								Identifiant
							</label>
							<Input
								id="lastName"
								className="focus:border-primary focus:ring-primary border-gray-300 focus:ring-1"
								value={user.id}
							/>
						</div>

						<div>
							<label htmlFor="position" className="mb-1 pl-2 text-sm font-medium">
								Organisation
							</label>
							<Input
								id="position"
								placeholder="Entrez votre poste"
								className="focus:border-primary focus:ring-primary border-gray-300 focus:ring-1 capitalize"
								value={user.orga}
							/>
						</div>
						<div>
							<label htmlFor="position" className="mb-1 pl-2 text-sm font-medium">
								Roles
							</label>
							<Input
								id="position"
								placeholder="Entrez votre poste"
								className="focus:border-primary focus:ring-primary border-gray-300 focus:ring-1"
								value={user.roles.join(", ")}
							/>
						</div>
					</div>

					<div className="flex justify-end border-t border-gray-100 pt-4">
						<Button className="bg-primary hover:bg-primary/90 px-6 font-medium text-white">Enregistrer</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

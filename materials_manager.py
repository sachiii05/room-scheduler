# Initialize an empty materials dictionary
materials = {}

def print_materials():
    """Print all materials and their properties."""
    if not materials:
        print("\nNo materials in the database.")
        return
    
    print("\nCurrent Materials:")
    for material, properties in materials.items():
        print(f"\n{material}:")
        for prop, value in properties.items():
            print(f"  {prop}: {value}")

def add_material():
    """Add a new material with user input."""
    print("\nAdd New Material")
    name = input("Enter material name: ")
    
    if name in materials:
        print("Material already exists!")
        return
    
    try:
        density = float(input("Enter density (kg/m³): "))
        strength = float(input("Enter strength (MPa): "))
        thermal_conductivity = float(input("Enter thermal conductivity (W/m·K): "))
        
        materials[name] = {
            'density': density,
            'strength': strength,
            'thermal_conductivity': thermal_conductivity
        }
        print(f"\n{name} has been added successfully!")
        print_materials()
    except ValueError:
        print("Invalid input! Please enter numeric values.")

def edit_material():
    """Edit a material's properties with user input."""
    if not materials:
        print("\nNo materials to edit!")
        return
        
    print_materials()
    name = input("\nEnter material name to edit: ")
    
    if name not in materials:
        print("Material not found!")
        return
    
    print("\nSelect property to edit:")
    print("1. Density")
    print("2. Strength")
    print("3. Thermal Conductivity")
    
    choice = input("Enter choice (1-3): ")
    
    try:
        if choice == '1':
            new_value = float(input("Enter new density (kg/m³): "))
            materials[name]['density'] = new_value
        elif choice == '2':
            new_value = float(input("Enter new strength (MPa): "))
            materials[name]['strength'] = new_value
        elif choice == '3':
            new_value = float(input("Enter new thermal conductivity (W/m·K): "))
            materials[name]['thermal_conductivity'] = new_value
        else:
            print("Invalid choice!")
            return
            
        print(f"\n{name} has been updated!")
        print_materials()
    except ValueError:
        print("Invalid input! Please enter numeric values.")

def delete_material():
    """Delete a material with user input."""
    if not materials:
        print("\nNo materials to delete!")
        return
        
    print_materials()
    name = input("\nEnter material name to delete: ")
    
    if name in materials:
        del materials[name]
        print(f"\n{name} has been deleted!")
        print_materials()
    else:
        print("Material not found!")

def main_menu():
    """Display and handle the main menu."""
    while True:
        print("\n=== Engineering Materials Manager ===")
        print("1. Add new material")
        print("2. Edit material")
        print("3. Delete material")
        print("4. View all materials")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            add_material()
        elif choice == '2':
            edit_material()
        elif choice == '3':
            delete_material()
        elif choice == '4':
            print_materials()
        elif choice == '5':
            print("\nGoodbye!")
            break
        else:
            print("Invalid choice! Please try again.")

if __name__ == "__main__":
    print("Welcome to Engineering Materials Manager!")
    main_menu()

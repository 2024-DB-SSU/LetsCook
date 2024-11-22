import os
import json


def merge_json_files(input_dir, output_file):
    '''
    Merges all JSON files in the specified directory into a single JSON file.

    PARAMETERS:
        - input_dir(str): Path to the directory containing JSON files.
        - output_file(str): Path to the output file that will store the merged JSON data.
    '''
    merged_data = []
    for filename in os.listdir(input_dir):
        if filename.endswith(".json"):
            file_path = os.path.join(input_dir, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    merged_data.append(data)
                    print(f"Success to load: {filename}")
            except Exception as e:
                print(f"Failed to load {filename}: {e}")

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=4)
        print(f"Success to merge files")
    except Exception as e:
        print(f"Failed to save merged file: {e}")


input_directory = "./data" 
output_file_path = "./recipes.json"

merge_json_files(input_directory, output_file_path)

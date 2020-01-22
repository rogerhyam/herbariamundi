
"""
    This is a simple upload script that will create Zenodo records for a folder full of 
    herbarium specimen images.

    before you start
    pip install requests 

"""

import requests
import csv
import os.path
import json
import datetime

import config


# entry point for script
def main():

    with open('success.txt', 'a+') as success_file:

        # put them all in a list so we can lookup quick
        success_file.seek(0)
        successes = success_file.read().splitlines()
        successes = [i.split('\t', 1)[0] for i in successes] # remove bit after tab
        success_file.seek(0, 2)

        # run through the csv file
        with open(config.METADATA_CSV_PATH) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            success_count = 0
            for row in csv_reader:

                # keep a handle on the headers
                if line_count == 0:
                    headings = row
                else:
                    filename = row[config.METADATA_COL_FILE]
                    if filename in successes:
                        continue
                    full_path = config.IMAGES_DIR_PATH + filename
                    if os.path.exists(full_path):
                        r = process_file(full_path, row, headings)
                        if r:
                            success_file.write("{}\t{}\n".format(filename, r))
                            print("Lines: {} | Success: {} | Link: {}".format(line_count, success_count, r))
                            success_count += 1

                    #if success_count > 1000:
                    #    break # debug
                    else:
                        print(filename)
                
                line_count += 1
            
            print(f'Processed {line_count} lines.')


# foreach jpg that exists
def process_file(file_path, metadata, headings):

    # create an empty deposit to play with 
    headers = {"Content-Type": "application/json"}
    r = requests.post(config.ZENODO_API_URI + 'deposit/depositions', params={'access_token': config.ZENODO_ACCESS_TOKEN}, json={}, headers=headers)
    if r.status_code != 201:
        print("Failed to create empty deposit")
        print(file_path)
        print(r.json())
        exit(1)

    # add the file
    deposition_id = r.json()['id']
    data = {'name': metadata[config.METADATA_COL_FILE]}
    files = {'file': open(file_path, 'rb')}
    r = requests.post(config.ZENODO_API_URI + 'deposit/depositions/%s/files' % deposition_id, params={'access_token': config.ZENODO_ACCESS_TOKEN}, data=data, files=files)
    if r.status_code != 201:
        print("Failed to add file")
        print(r.json())
        exit(1)

    # set the metadata about the specimen

    # Title
    # scientific name collected by dd # number
    title = "{} from Colombia collected by {} #{}".format(metadata[config.METADATA_COL_SCIENTIFIC_NAME], metadata[config.METADATA_COL_COLLECTORS], metadata[config.METADATA_COL_COLLECTOR_NUMBER] )

    # Description
    description = ''
    count = 0
    for head in headings:
        val = metadata[count]
        if not val:
            count += 1
            continue 
        description += "<p><strong>{}</strong>: <span>{}</span></p>\n".format(head, metadata[count])
        count += 1

    # Authors
    creators = []
    if metadata[config.METADATA_COL_COLLECTORS]:
        collectors = metadata[config.METADATA_COL_COLLECTORS].strip().split(',')
        for col in collectors:
            parts = col.split(' ')
            parts.reverse()
            col_name = ', '.join(parts)
            creators.append({'name': col_name})

    # Date
    d_str = metadata[config.METADATA_COL_DATE].strip(' .')
    try:
        d = datetime.datetime.strptime(d_str, '%d/%m/%Y')
    except:
        d = datetime.datetime.now()

    d_str =  d.strftime('%Y-%m-%d')

    # Subjects
    subjects = []
    # hardcode colombia for now
    subjects.append({
            'identifier': "https://www.wikidata.org/wiki/Q739",
            'scheme': "url",
            'term': "Colombia" })
    # site

    # collector


    # Assemble the actual data
    data = {'metadata':{
        'title': title,
        'upload_type': 'image',
        'image_type': 'photo',
        'description': description,
        'creators': creators,
        'publication_date': d_str,
        'access_right': "open",
        'communities': [{ 'identifier': "bravo" },{'identifier': 'herbariamundi'}],
        'subjects': subjects
        }
    }

    r = requests.put(config.ZENODO_API_URI + 'deposit/depositions/%s' % deposition_id, params={'access_token': config.ZENODO_ACCESS_TOKEN}, data=json.dumps(data), headers=headers)
    
    if r.status_code != 200:
        print("Failed to update metadata")
        print(r.json())
        exit(1)

    # finally publish it!!
    r = requests.post(config.ZENODO_API_URI + 'deposit/depositions/%s/actions/publish' % deposition_id, params={'access_token': config.ZENODO_ACCESS_TOKEN} )
    if r.status_code != 202:
        print("Failed to publish deposit")
        print(r.json())
        exit(1)

    # got to here so return good stuff
    return r.json().get('links').get('latest_html')

# actually run the thing
main()
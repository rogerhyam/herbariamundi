
# You must set your secret Zenodo access token so that Zenodo knows who it is uploading the entries.
# Log into Zenodo (preferably using your ORCID ID). Go to 'Applications' under your profile and create a 'Personal Access Token'
# choosing to enable the deposit:actions and deposit:write scopes but not the user:email scope.
# Cut and paste the key below immediately
# *** Do not share this personal access token. It gives full access to your account. ***
# You can delete it after you have finished with the script or before passing this script to someone else!!
# ZENODO_ACCESS_TOKEN = '' # sandbox
ZENODO_ACCESS_TOKEN = 'Secret from GIT' # live

# uri of zenodo api. must end in /
# you can use the the sandbox version for testing in parallel system
ZENODO_API_URI = 'https://zenodo.org/api/'
#ZENODO_API_URI = 'https://sandbox.zenodo.org/api/'

# this is the path to a csv file containing a list of the jpg files to be uploaded (one per specimen)
# as well as metadata associated with the specimens
# the default is a file in the same dir as the script with.
METADATA_CSV_PATH = 'metadata.csv'

# This is the path to the directory containing the JPG files mentioned in the metadata file.
# the default is a directory in the same directory as the script is run    
# Must end with trailing slash
IMAGES_DIR_PATH = '/Volumes/JPGS/'

# Mappings for non-standard csv file
METADATA_COL_FILE = 0
METADATA_COL_TITLE = 1
METADATA_COL_COLLECTOR_NUMBER = 7
METADATA_COL_COLLECTORS = 9
METADATA_COL_DATE = 13
METADATA_COL_SCIENTIFIC_NAME = 43


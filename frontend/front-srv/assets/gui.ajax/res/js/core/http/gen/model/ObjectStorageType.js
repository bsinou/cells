/**
 * Pydio Cells Rest API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */


import ApiClient from '../ApiClient';


/**
* Enum class ObjectStorageType.
* @enum {}
* @readonly
*/
export default class ObjectStorageType {
    
        /**
         * value: "LOCAL"
         * @const
         */
        LOCAL = "LOCAL";

    
        /**
         * value: "S3"
         * @const
         */
        S3 = "S3";

    
        /**
         * value: "SMB"
         * @const
         */
        SMB = "SMB";

    
        /**
         * value: "CELLS"
         * @const
         */
        CELLS = "CELLS";

    
        /**
         * value: "AZURE"
         * @const
         */
        AZURE = "AZURE";

    
        /**
         * value: "GCS"
         * @const
         */
        GCS = "GCS";

    
        /**
         * value: "B2"
         * @const
         */
        B2 = "B2";

    
        /**
         * value: "MANTA"
         * @const
         */
        MANTA = "MANTA";

    
        /**
         * value: "SIA"
         * @const
         */
        SIA = "SIA";

    

    /**
    * Returns a <code>ObjectStorageType</code> enum value from a Javascript object name.
    * @param {Object} data The plain JavaScript object containing the name of the enum value.
    * @return {module:model/ObjectStorageType} The enum <code>ObjectStorageType</code> value.
    */
    static constructFromObject(object) {
        return object;
    }
}



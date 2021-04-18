using ermitsognnedeFunctions.Services;
using ermitsognnedeFunctions.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions
{
    public static class DownloadCovidData
    {
        private static ICovidDataClient _covidDataClient = new CovidDataClient();
        private static IZipArchiveService _zipArchiveService = new ZipArchiveService();
        private static IDistictService _distictService = new DistictService();

        [FunctionName("DownloadCovidDataToJson")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req, ILogger log)
        {
            log.LogInformation($"{nameof(DownloadCovidData)} Timer trigger function stated execution at: {DateTime.Now}");

            var covidDataZipFileStream = await _covidDataClient.GetInfectionLevelsOnDistrictLevelAsync();
            var covidDistrictExcelFileStream = await _zipArchiveService.GetDistictData(covidDataZipFileStream);
            var discrictJsonModels = _distictService.GetDistrictDataJsonModels(covidDistrictExcelFileStream);

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonConvert.SerializeObject(discrictJsonModels), Encoding.UTF8, "application/json")
            };
        }
    }
}

using CsvHelper;
using CsvHelper.Configuration;
using ermitsognnedeFunctions.Mappers;
using ermitsognnedeFunctions.Models;
using ermitsognnedeFunctions.Services.Interfaces;
using NPOI.SS.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace ermitsognnedeFunctions.Services
{
    public class DistictService : IDistictService
    {
        public List<DistrictDataJsonModel> GetDistrictDataJsonModels(List<FileModel> fileModels)
        {
            var fileExtension = Path.GetExtension(fileModels.FirstOrDefault(x => x.FileDataType == FileDataType.DistrictData).FileName);
            switch (fileExtension.ToLower())
            {
                case ".csv":
                    return GetFromCsvFile(fileModels);

                case ".xlsx":
                case ".xls":
                    return null;
                    //return GetFromExcelFile(fileModels.FirstOrDefault(x => x.FileDataType == FileDataType.DistrictData));
            }

            return null;
        }

        private List<DistrictDataJsonModel> GetFromCsvFile(List<FileModel> fileModels)
        {
            var results = new List<DistrictDataJsonModel>();

            var csvConfig = new CsvConfiguration(new CultureInfo("da-DK", false))
            {
                Delimiter = ";"
            };

            var districtFile = fileModels.FirstOrDefault(x => x.FileDataType == FileDataType.DistrictData);
            var municipalityFile = fileModels.FirstOrDefault(x => x.FileDataType == FileDataType.Municipality);

            districtFile.Stream.Seek(0, SeekOrigin.Begin);
            municipalityFile.Stream.Seek(0, SeekOrigin.Begin);

            using (var municipalityReader = new StreamReader(municipalityFile.Stream))
            using (var municipalityCsvStream = new CsvReader(municipalityReader, csvConfig))
            using (var disctrictReader = new StreamReader(districtFile.Stream))
            using (var districtCsvStream = new CsvReader(disctrictReader, csvConfig))
            {
                municipalityCsvStream.Context.RegisterClassMap<MunicipalityDataCsvModelMapper>();
                var municipalityModels = municipalityCsvStream.GetRecords<MunicipalityDataCsvModel>()?.ToList();
                if (municipalityModels != null)
                    municipalityModels = municipalityModels.Where(x => x.StatusForAutomaticClosing.ToLowerInvariant() == "nedlukket").ToList();

                districtCsvStream.Context.RegisterClassMap<DistrictDataCsvModelMapper>();
                var csvModels = districtCsvStream.GetRecords<DistrictDataCsvModel>();
                if (csvModels == null)
                    return null;

                foreach (var csvModel in csvModels)
                {
                    if (csvModel == null)
                        continue;

                    var StartOfLatestAutomaticShutdownDate = csvModel.StartOfLatestAutomaticShutdown.ToLowerInvariant() != "na" && DateTime.TryParse(csvModel.StartOfLatestAutomaticShutdown, out var dateValue)
                        ? dateValue
                        : default(DateTime?);

                    results.Add(new DistrictDataJsonModel
                    {
                        District = csvModel.District,
                        DistrictCode = csvModel.DistrictCode,
                        DistrictPopulationCount = csvModel.DistrictPopulationCount,
                        Incidence = csvModel.Incidence,
                        IsClosed = csvModel.StatusForAutomaticClosing.ToLowerInvariant() == "nedlukket",
                        Municipality = csvModel.Municipality.ToLowerInvariant() == "na" ? null : csvModel.Municipality,
                        Municipality2 = csvModel.Municipality2.ToLowerInvariant() == "na" ? null : csvModel.Municipality2,
                        Municipality3 = csvModel.Municipality3.ToLowerInvariant() == "na" ? null : csvModel.Municipality3,
                        NewInfectedCount = csvModel.NewInfectedCount,
                        PositivePercentage = csvModel.PositivePercentage,
                        StartOfLatestAutomaticShutdown = StartOfLatestAutomaticShutdownDate
                    });
                }
            }

            return results;
        }

        private List<DistrictDataJsonModel> GetFromExcelFile(FileModel fileModel)
        {
            var workbook = WorkbookFactory.Create(fileModel.Stream);
            var firstSheet = workbook.GetSheetAt(0);

            var result = new List<DistrictDataJsonModel>();
            for (int rowIndex = 4; rowIndex < firstSheet.LastRowNum; rowIndex++)
            {
                var row = firstSheet.GetRow(rowIndex);

                if (row == null)
                    continue;

                result.Add(new DistrictDataJsonModel
                {
                    DistrictCode = (int)row.GetCell(1)?.NumericCellValue,
                    District = row.GetCell(2)?.StringCellValue,
                    Municipality = row.GetCell(3)?.StringCellValue,
                    DistrictPopulationCount = (int)row.GetCell(5)?.NumericCellValue,
                    Incidence = (double)row.GetCell(6)?.NumericCellValue,
                    NewInfectedCount = (int)row.GetCell(7)?.NumericCellValue,
                    PositivePercentage = (double)(row.GetCell(8)?.NumericCellValue),
                    IsClosed = row.GetCell(9)?.StringCellValue?.ToLower() == "nedlukket",
                    StartOfLatestAutomaticShutdown = row.GetCell(10)?.CellType == CellType.String ? null : row.GetCell(10)?.DateCellValue
                });
            }

            return result;
        }
    }
}
